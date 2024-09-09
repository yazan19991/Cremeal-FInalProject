using System;
using System.Linq;
using System.Text;

namespace CremealServer.Models.Services
{
    public class PasswordGenerator
    {
        private static readonly Random random = new Random();
        private const string Uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string Lowercase = "abcdefghijklmnopqrstuvwxyz";
        private const string Digits = "0123456789";
        private const string SpecialChars = "!@#$%^&*()_-+=<>?";

        public static string GeneratePassword(int length)
        {
            if (length < 4)
            {
                throw new ArgumentException("Password length must be at least 4 characters.");
            }

            var allChars = Uppercase + Lowercase + Digits + SpecialChars;
            var password = new StringBuilder();

            // Ensure the password contains at least one character from each category
            password.Append(Uppercase[random.Next(Uppercase.Length)]);
            password.Append(Lowercase[random.Next(Lowercase.Length)]);
            password.Append(Digits[random.Next(Digits.Length)]);
            password.Append(SpecialChars[random.Next(SpecialChars.Length)]);

            // Fill the rest of the password length with random characters
            for (int i = 4; i < length; i++)
            {
                password.Append(allChars[random.Next(allChars.Length)]);
            }

            // Shuffle the characters in the password
            return new string(password.ToString().OrderBy(x => random.Next()).ToArray());
        }
    }
}
