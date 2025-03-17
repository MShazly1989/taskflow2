# Project Bolt

...existing content...

## Troubleshooting

### SonarQube SSL Verification Issue

If you encounter an error where SonarQube for IDE could not verify the authenticity of the downloaded file, follow these steps to resolve the issue:

1. **Check Your Network Connection**: Ensure that your internet connection is stable and that there are no network issues.

2. **Update SonarQube Plugin**: Make sure you are using the latest version of the SonarQube plugin for your IDE.

3. **Check SSL Certificates**: Verify that the SSL certificates on your machine are up to date. You can update them by running the following command in the terminal:
   ```sh
   sudo update-ca-certificates
   ```

4. **Configure SonarQube to Trust the Certificate**:
   - If you are using a self-signed certificate, you may need to configure SonarQube to trust it. You can do this by adding the certificate to the Java keystore.
   - Locate your Java keystore file (usually found in the JRE/lib/security/cacerts directory).
   - Import the certificate using the following command:
     ```sh
     keytool -import -alias your_alias -keystore path_to_cacerts -file path_to_certificate
     ```
   - Restart your IDE after importing the certificate.

5. **Disable SSL Verification (Not Recommended)**: As a last resort, you can disable SSL verification. This is not recommended for production environments as it can expose you to security risks. To disable SSL verification, you can set the following environment variable:
   ```sh
   export SONAR_SCANNER_OPTS="-Djavax.net.ssl.trustStoreType=JKS -Djavax.net.ssl.trustStore=/path/to/your/truststore.jks -Djavax.net.ssl.trustStorePassword=changeit"
   ```

If the issue persists, check the SonarQube documentation or contact their support for further assistance.
