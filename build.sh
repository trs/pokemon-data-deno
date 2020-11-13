#!/bin/bash

# Install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# Generate data
deno run --allow-net --allow-read --allow-write ./generate/main.ts ./api/data
