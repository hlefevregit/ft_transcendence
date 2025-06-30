#!/bin/sh
set -e

# If Nginx ModSecurity directory does not exist, create it.
if [ ! -d /etc/modsecurity ]; then
	echo "Creating ModSecurity directory..."
	mkdir -p /etc/modsecurity
fi

# If ModSecurity configuration file does not exist, download the recommended configuration and setup logging/security rules.
if [ ! -f /etc/modsecurity/modsecurity.conf ]; then
	echo "Downloading ModSecurity configuration file..."
    curl -sSL https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended \
        -o /etc/modsecurity/modsecurity.conf
	echo "Configuring ModSecurity..."
    sed -i -E 's/^\s*#?\s*(SecRuleEngine)\s+(DetectionOnly|Off)/\1 On/' /etc/modsecurity/modsecurity.conf
    sed -i -E 's/^\s*#?\s*(SecDebugLog)\s+.*/\1 \/dev\/stderr/' /etc/modsecurity/modsecurity.conf
    sed -i -E 's/^\s*#?\s*(SecAuditLog)\s+.*/\1 \/dev\/stderr/' /etc/modsecurity/modsecurity.conf
    sed -i -E 's/^\s*#?\s*(SecDebugLogLevel)\s+.*/\1 3/' /etc/modsecurity/modsecurity.conf
fi

# If the ModSecurity Unicode mapping file does not exist, download it.
if [ ! -f /etc/modsecurity/unicode.mapping ]; then
	echo "Downloading ModSecurity Unicode mapping file..."
    curl -sSL https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/unicode.mapping \
        -o /etc/modsecurity/unicode.mapping
fi

# Fetch OWASP Core Rule Set (CRS) only if it isn't already present.
if [ ! -f /etc/modsecurity/crs/INSTALL.md ]; then
	echo "Downloading OWASP Core Rule Set (CRS)..."
    git clone --depth=1 https://github.com/coreruleset/coreruleset /tmp/crs
	if [ ! -d /etc/modsecurity/crs ]; then
		echo "Creating CRS directory..."
		mkdir -p /etc/modsecurity/crs
	fi
    cp -r /tmp/crs/* /etc/modsecurity/crs
    cp /etc/modsecurity/crs/crs-setup.conf.example /etc/modsecurity/crs/crs-setup.conf
    rm -rf /tmp/crs
fi

# Write main.conf if not already created.
if [ ! -f /etc/modsecurity/main.conf ]; then
    echo "Creating main ModSecurity configuration file..."
	# Writing the base includes.
    {
        echo 'Include /etc/modsecurity/modsecurity.conf'
        echo 'Include /etc/modsecurity/crs/crs-setup.conf'
        # Loop through each CRS rule file to include them.
        for rule in /etc/modsecurity/crs/rules/*.conf; do
            [ -f "$rule" ] && echo "Include $rule"
        done
    } > /etc/modsecurity/main.conf
	echo "ModSecurity main configuration file created at /etc/modsecurity/main.conf"
fi

echo "ModSecurity configuration is complete. Launching Nginx..."



# Launch nginx in foreground.
exec nginx -g "daemon off;"
