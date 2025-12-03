# Kubernetes V2

---

# 0) IPs, hostnames

- Nodes: `kube-01 192.168.250.101`, `kube-02 192.168.250.102`, `kube-03 192.168.250.103`,
  `kube-04 192.168.250.104` .
- OS: Ubuntu 24.04 LTS.
- Kernel ≥ 5.10 recommended for eBPF socket LB.
  [Cilium Documentation](https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free.html)

# 1) Prep all four nodes

```bash
# Hostnames
sudo hostnamectl set-hostname kube-01   # on .101
sudo hostnamectl set-hostname kube-02   # on .102
sudo hostnamectl set-hostname kube-03   # on .103
sudo hostnamectl set-hostname kube-04   # on .104
```

```bash
# /etc/hosts (run on all)
cat <<'EOF' | sudo tee -a /etc/hosts
192.168.250.101 kube-01
192.168.250.102 kube-02
192.168.250.103 kube-03
192.168.250.104 kube-04
EOF

# Time sync
sudo apt-get update
sudo apt-get install -y chrony
sudo systemctl enable --now chrony || sudo systemctl enable --now chronyd

# Kernel mods + sysctl
cat <<'EOF' | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay && sudo modprobe br_netfilter

cat <<'EOF' | sudo tee /etc/sysctl.d/99-k8s.conf
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
EOF
sudo sysctl --system

# Disable swap
sudo swapoff -a
sudo sed -i '/\sswap\s/s/^/#/' /etc/fstab
```

# 2) Install container runtime (containerd 2.1.4 + runc 1.3.3 + CNI 1.8.0)

```bash
# === Directories ===
sudo mkdir -p /usr/local/bin /usr/local/sbin /opt/cni/bin /etc/containerd

# === runc v1.3.3 ===
curl -fsSL -o /tmp/runc https://github.com/opencontainers/runc/releases/download/v1.3.3/runc.amd64
sudo install -m 0755 /tmp/runc /usr/local/sbin/runc

# === CNI plugins v1.8.0 ===
CNI_VER=v1.8.0
curl -fsSL https://github.com/containernetworking/plugins/releases/download/${CNI_VER}/cni-plugins-linux-amd64-${CNI_VER}.tgz \
 | sudo tar -xz -C /opt/cni/bin

# === containerd v2.1.4 ===
CTR_VER=2.1.4
curl -fsSL https://github.com/containerd/containerd/releases/download/v${CTR_VER}/containerd-${CTR_VER}-linux-amd64.tar.gz \
 | sudo tar -xz -C /usr/local

# === systemd unit file ===
sudo curl -fsSL -o /etc/systemd/system/containerd.service \
  https://raw.githubusercontent.com/containerd/containerd/main/containerd.service

# === default config ===
sudo /usr/local/bin/containerd config default | sudo tee /etc/containerd/config.toml >/dev/null
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# === enable service ===
sudo systemctl daemon-reload
sudo systemctl enable containerd
sudo systemctl restart containerd

# === verify ===
sudo systemctl status containerd --no-pager
containerd --version
runc --version
```

# 3) Install Kubernetes 1.34.1 (kubeadm/kubelet/kubectl) on all nodes

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
 | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /' \
 | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

Notes: `pkgs.k8s.io` is the community-owned repo per official docs.

# 4) Initialize the control plane on kube-01 (skip kube-proxy)

We must **not** deploy kube-proxy because Cilium will replace it. Use kubeadm to skip that phase.
This matches Cilium’s kube-proxy-free guide.
[Cilium Documentation](https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free.html)

```
# Choose a pod CIDR. Cilium can autodetect, but using 10.244.0.0/16 is fine.
POD_CIDR=10.244.0.0/16

# Temporary remooving the Tain on the control node
kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true

sudo kubeadm init \
  --pod-network-cidr=${POD_CIDR} \
  --skip-phases=addon/kube-proxy

# Kubeconfig for your user
mkdir -p $HOME/.kube
sudo cp -f /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Save the join commands for workers
kubeadm token create --print-join-command
```

# 5) Install Cilium with kube-proxy replacement

Cilium’s kube-proxy replacement is enabled by setting `kubeProxyReplacement=true` and relying on
socket LB.

```bash
# Install cilium CLI (Linux x86_64)
CIL_VER=$(curl -fsSL https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
curl -fsSL -o cilium.tar.gz https://github.com/cilium/cilium-cli/releases/download/${CIL_VER}/cilium-linux-amd64.tar.gz
sudo tar -C /usr/local/bin -xzvf cilium.tar.gz cilium && rm cilium.tar.gz
# Install latest stable Cilium with kube-proxy replacement
cilium install \
  --version 1.18.3 \
  --set kubeProxyReplacement=true \
  --set k8sServiceHost=127.0.0.1 \
  --set k8sServicePort=6443
# Wait until ready
cilium status --wait
```

# 6) Join workers

Run the join command printed in step 4 on `kube-02`,`kube-03` and `kube-04`.

Example:

```bash
sudo kubeadm join 192.168.250.101:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH>
```

After that, we ca put the taint back on kube 1

```bash
# On kube-1 put the taint again when at least the first worker is ready
kubectl taint node kube-01 node-role.kubernetes.io/control-plane=:NoSchedule
```

# 7) Post-install checks

```bash
# On kube-01
kubectl get nodes -o wide
kubectl -n kube-system get pods -o wide

# Confirm kube-proxy is NOT present
kubectl -n kube-system get ds/kube-proxy || echo "kube-proxy not installed (expected)"

# Validate Cilium KPR operational
cilium status
cilium connectivity test   # optional test to test that Cilium work properly
```

# 8) Rook Ceph installation

Make sure to have the same sdb empty disk on each node

Then run on kube 1

```bash
helm repo add rook-release https://charts.rook.io/release
helm repo update

# Operator v1.18.6
helm install rook-ceph rook-release/rook-ceph \
  --namespace rook-ceph --create-namespace \
  --version 1.18.6

sudo mkdir -p /home/damien/rook

sudo tee /home/damien/rook/rook-ceph-cluster.values.yaml > /dev/null <<'EOF'
# rook-ceph-cluster.values.yaml
operatorNamespace: rook-ceph

toolbox:
  enabled: true  # gives `rook-ceph-tools` for ceph CLI

cephClusterSpec:
  cephVersion:
    image: quay.io/ceph/ceph:v19.2.3
  dataDirHostPath: /var/lib/rook

  mon:
    count: 3
    allowMultiplePerNode: false
  mgr:
    count: 1

  dashboard:
    enabled: true
    ssl: true

  # If we need OSDs on the tainted control-plane node
  placement:
    osd:
      tolerations:
        - key: "node-role.kubernetes.io/control-plane"
          operator: "Exists"
          effect: "NoSchedule"

  storage:
    useAllNodes: false
    useAllDevices: false
    nodes:
      - name: kube-01
        devices: [{name: "sdb"}]
      - name: kube-02
        devices: [{name: "sdb"}]
      - name: kube-03
        devices: [{name: "sdb"}]
      - name: kube-04
        devices: [{name: "sdb"}]

# Create a replicated pool + a StorageClass for RBD (block)
cephBlockPools:
  - name: replicapool
    spec:
      failureDomain: host
      replicated:
        size: 4
        requireSafeReplicaSize: true
    storageClass:
      enabled: true
      name: rook-ceph-block
      isDefault: true
      allowVolumeExpansion: true
      reclaimPolicy: Delete
      parameters:
        imageFeatures: layering,fast-diff,object-map,deep-flatten,exclusive-lock
        csi.storage.k8s.io/fstype: ext4
      mountOptions:
        - discard
EOF

helm install rook-ceph-cluster rook-release/rook-ceph-cluster \
  --namespace rook-ceph \
  --version 1.18.6 \
  -f /home/damien/rook/rook-ceph-cluster.values.yaml \
  --wait
```

Make sure that rook ceph is the default storage class :

```bash
kubectl patch storageclass rook-ceph-block -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

Check if Rook Ceph is ready :

```bash
kubectl -n rook-ceph get pods
kubectl -n rook-ceph get cephcluster
# toolbox was enabled above:
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph status
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph osd tree
```

Once ready put the appropriate value in the volumes claims to use it (example) :

```yaml
volumeClaimTemplates:
    - metadata:
          name: postgres-data
      spec:
          accessModes: ["ReadWriteOnce"]
          storageClassName: rook-ceph-block
          resources:
              requests:
                  storage: 20Gi
```

If you want to access the dashboard temporarily, you can run :

```bash
kubectl -n rook-ceph patch svc rook-ceph-mgr-dashboard -p '{"spec":{"type":"NodePort","ports":[{"name":"https-dashboard","port":8443,"targetPort":8443,"nodePort":32443}]}}'
```

And this to get the password for the rook ceph admin user :

```bash
kubectl -n rook-ceph get secret rook-ceph-dashboard-password   -o jsonpath='{.data.password}' | base64 -d; echo
```
