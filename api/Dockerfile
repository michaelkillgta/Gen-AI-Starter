# Production image for the Rust API (small Debian runtime, non-root).
# Build from the repo root:  docker build -f api/Dockerfile -t field-tested-api .
FROM rust:1-bookworm AS build
WORKDIR /src/api
# Cache dependencies separately from our code.
COPY api/Cargo.toml api/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src
COPY api/ ./
RUN touch src/main.rs && cargo build --release --bin api

FROM debian:bookworm-slim AS run
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 app
WORKDIR /app
COPY --from=build /src/api/target/release/api /app/api
COPY api/seed /app/seed
ENV API_BIND=0.0.0.0:8080 SEED_DIR=/app/seed STORAGE=postgres RUST_LOG=api=info,tower_http=info
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD wget -qO- http://127.0.0.1:8080/health >/dev/null || exit 1
ENTRYPOINT ["/app/api"]
CMD ["serve"]
