ui = true

storage "file" {
  path = "/vault/file"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/vault/certs/cert.pem"
  tls_key_file  = "/vault/certs/key.pem"
}

disable_mlock = true
default_lease_ttl = "1h"
max_lease_ttl = "4h"
