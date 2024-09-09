namespace CremealServer.Models.ConfigureOptions
{
    public class AuthenticationConfiguration
    {
        public string AccessTokenSecret { get; set; }   
        public double AccessTokenExpirationDays { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }    

    }
}
