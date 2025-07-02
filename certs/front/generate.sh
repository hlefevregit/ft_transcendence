#!/bin/bash

set -e  # Arrête le script en cas d'erreur

# Dossiers
CERT_DIR="$(pwd)"
CA_DIR="$CERT_DIR/CA"

# Fichiers
CA_KEY="$CA_DIR/myCA.key"
CA_CRT="$CA_DIR/myCA.crt"
SERVER_KEY="$CERT_DIR/server.key"
SERVER_CSR="$CERT_DIR/server.csr"
SERVER_CRT="$CERT_DIR/server.crt"
SSL_CONF="$CERT_DIR/ssl.conf"
CA_EXT="$CA_DIR/CA.ext"

# 1. Générer la clé privée de la CA
echo "[1/6] Génération de la clé privée de la CA..."
openssl genrsa -out "$CA_KEY" 2048

# 2. Générer le certificat auto-signé de la CA
echo "[2/6] Génération du certificat auto-signé de la CA..."
openssl req -x509 -new -nodes \
  -key "$CA_KEY" \
  -sha256 -days 3650 \
  -out "$CA_CRT" \
  -subj "/C=FR/ST=PACA/L=Nice/O=42Nice/OU=CA/CN=42Nice-Local-CA"

# 3. Générer la clé privée du serveur
echo "[3/6] Génération de la clé privée du serveur..."
openssl genrsa -out "$SERVER_KEY" 2048

# 4. Générer la requête de certificat (CSR) pour le serveur
echo "[4/6] Génération de la CSR du serveur..."
openssl req -new \
  -key "$SERVER_KEY" \
  -out "$SERVER_CSR" \
  -config "$SSL_CONF"

# 5. Signer le certificat avec la CA
echo "[5/6] Signature du certificat serveur avec la CA..."
openssl x509 -req \
  -in "$SERVER_CSR" \
  -CA "$CA_CRT" -CAkey "$CA_KEY" -CAcreateserial \
  -out "$SERVER_CRT" \
  -days 825 -sha256 \
  -extfile "$CA_EXT"

# 6. Nettoyage
echo "[6/6] Terminé avec succès ✅"