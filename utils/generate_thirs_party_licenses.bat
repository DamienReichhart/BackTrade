@echo off

REM If not working, install:
REM pnpm i -g npm-license-generator 

pnpm dlx generate-license-file --input pnpm-lock.yaml --output THIRD_PARTY_LICENSES.txt