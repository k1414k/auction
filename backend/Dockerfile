FROM ruby:3.2.4-slim AS base

ENV RAILS_ENV=production \
    RACK_ENV=production \
    BUNDLE_WITHOUT="development:test" \
    BUNDLE_PATH="/usr/local/bundle" \
    LANG=C.UTF-8 \
    PATH="/usr/local/bundle/bin:${PATH}"

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      curl \
      libpq5 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS gems

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./
RUN bundle config set without "$BUNDLE_WITHOUT" && \
    bundle install --jobs="$(nproc)" --retry 3 && \
    rm -rf /usr/local/bundle/cache/*.gem

FROM base AS runner

COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY . .

RUN groupadd --system rails && \
    useradd --system --gid rails --create-home --shell /usr/sbin/nologin rails && \
    mkdir -p log tmp/pids tmp/cache tmp/storage storage && \
    chmod +x /app/entrypoint.sh && \
    chown -R rails:rails /app

USER rails

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
