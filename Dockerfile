FROM mcr.microsoft.com/playwright:v1.62.1-noble
WORKDIR /app
ARG NEXT_VERSION=16.2.6
COPY package.json ./
RUN npm pkg set dependencies.next=$NEXT_VERSION && npm install --no-audit --no-fund
COPY next.config.mjs playwright.config.js ./
COPY app ./app
COPY tests ./tests
COPY variants ./variants
# VARIANT=v2 swaps in a detail page with generateMetadata and a ~10 KB payload.
ARG VARIANT=
RUN if [ -n "$VARIANT" ]; then cp variants/$VARIANT/page.jsx "app/(app)/items/[id]/page.jsx"; fi
RUN npx next build
ENV NEXT_TELEMETRY_DISABLED=1
# RUNS and MAX_FAILURES are read at run time.
CMD ["sh", "-c", "npx playwright test --repeat-each=${RUNS:-300} --max-failures=${MAX_FAILURES:-0}"]
