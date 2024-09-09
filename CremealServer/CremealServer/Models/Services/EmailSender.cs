using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using CremealServer.Models.ConfigureOptions;
using CremealServer.Models.Requests;

namespace CremealServer.Models.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailSettings _appSettings;

        public EmailSender(IOptions<EmailSettings> emailSettings)
        {
            _appSettings = emailSettings.Value;

        }

        public void Send(string to, string subject, string html, string from = null)
        {
            // create message
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(from ?? _appSettings.EmailFrom));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = html };

            // send email
            using var smtp = new SmtpClient();
            smtp.Connect(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.StartTls);
            smtp.Authenticate(_appSettings.SmtpUser, _appSettings.SmtpPass);
            smtp.Send(email);
            smtp.Disconnect(true);
        }

        public void SendBulkEmail(BulkEmailRequest bulkRequest, string from = null)
        {
            using var smtp = new SmtpClient();
            smtp.Connect(_appSettings.SmtpHost, _appSettings.SmtpPort, SecureSocketOptions.StartTls);
            smtp.Authenticate(_appSettings.SmtpUser, _appSettings.SmtpPass);

            foreach (var emailAddress in bulkRequest.Emails)
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(from ?? _appSettings.EmailFrom));
                email.To.Add(MailboxAddress.Parse(emailAddress));
                email.Subject = bulkRequest.Subject;

                // Use the email address as the user name in the body
                var customizedBody = Helpers.ReadAdminHtmlTemplate("emailForUsersFromAdmin", emailAddress, bulkRequest.Body);
                email.Body = new TextPart(TextFormat.Html) { Text = customizedBody };

                try
                {
                    smtp.Send(email);
                }
                catch (Exception ex)
                {
                    OurLogger.Instance.LogError($"Failed to send email to {emailAddress}: {ex.Message}");
                }
            }

            smtp.Disconnect(true);
        }


    }
}
