using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using System.Net;
using System.Security.Authentication;


public class EmailService : IEmailService
{

    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendPasswordResetEmailAsync(string email, string name, string resetLink)
    {
        using var client = new SmtpClient();

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["EmailSettings:SenderName"],
                _configuration["EmailSettings:SenderEmail"]));
            message.To.Add(new MailboxAddress(name, email));
            message.Subject = "Password Reset Request";

            message.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
                    <h2>Password Reset</h2>
                    <p>Hello {name},</p>
                    <p>Click <a href='{resetLink}'>here</a> to reset your password.</p>
                    <p>This link expires in 15 minutes.</p>"
            };

            client.Timeout = 30000;
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            _logger.LogInformation("Attempting to connect to SMTP server...");

            await client.ConnectAsync(
                _configuration["EmailSettings:MailServer"],
                int.Parse(_configuration["EmailSettings:MailPort"]),
                SecureSocketOptions.StartTls);
            _logger.LogInformation("Connected to SMTP server. Authenticating...");
            await client.AuthenticateAsync(
                _configuration["EmailSettings:SenderEmail"],
                _configuration["EmailSettings:Password"]); 
            _logger.LogInformation("Authentication successful. Sending email...");

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully!");
            return true;
        }
        catch (MailKit.Security.AuthenticationException ex)
        {
            _logger.LogError($"Authentication failed: {ex.Message}");
            _logger.LogDebug("Check your App Password and ensure 2FA is enabled in Google Account");
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError($"SMTP Error ({ex.StatusCode}): {ex.Message}");
            _logger.LogDebug($"Error details: {ex.ErrorCode} - {ex.Mailbox}");
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError($"Protocol error: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"General error: {ex.Message}");
        }
        finally
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true);
            }
        }

        return false;
    }
}
