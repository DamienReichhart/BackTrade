#!/bin/bash

echo "Starting Stripe webhook listener..."
stripe listen --forward-to http://localhost:21799/api/v1/stripe/webhook