using CremealServer.Models.Requests;

namespace CremealServer.Models
{
    public interface IEmailSender
    {
        void Send(string to, string subject, string html, string from = null);
        void SendBulkEmail(BulkEmailRequest bulkRequest, string from = null);
    }
}
