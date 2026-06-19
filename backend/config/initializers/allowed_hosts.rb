# Allow public reverse-proxy hosts and private Docker service hosts.
#
# RAILS_HOSTS is for browser-facing API domains such as api.example.com.
# RAILS_INTERNAL_HOSTS is for server-to-server calls inside Docker, for example
# Next.js API Routes calling http://backend:3000.
[
  ENV["RAILS_HOSTS"],
  ENV["RAILS_INTERNAL_HOSTS"]
].compact.join(",").split(",").map(&:strip).reject(&:blank?).uniq.each do |host|
  Rails.application.config.hosts << host
end
