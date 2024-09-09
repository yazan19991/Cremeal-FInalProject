using System.Text;
using CremealServer.Models.DAL;
using CremealServer.Models.Requests;
using Newtonsoft.Json;

namespace CremealServer.Models
{
    /// <summary>
    /// Represents a meal with properties and methods for meal-related operations.
    /// </summary>
    public class Meal
    {
        /// <summary>
        /// Gets or sets the unique identifier for the meal.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the meal.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the image link for the meal.
        /// </summary>
        public string ImageLink { get; set; }

        /// <summary>
        /// Gets or sets the description of the meal.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the cooking time for the meal in minutes.
        /// </summary>
        public int CookingTime { get; set; }

        /// <summary>
        /// Gets or sets the ingredients used in the meal.
        /// </summary>
        public string Ingredients { get; set; }

        /// <summary>
        /// Gets or sets the instructions for preparing the meal.
        /// </summary>
        public string Instructions { get; set; }

        /// <summary>
        /// Gets or sets the difficulty level of the meal preparation.
        /// </summary>
        public string Difficulty { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the meal is marked as a favorite.
        /// </summary>
        public bool? Favorite { get; set; }

        private static int MealImageCounter = 0;

        public Meal() { }

        public Meal(string name, string imageLink, string description, int cookingTime, string ingredients, string difficulty)
        {
            Name = name;
            ImageLink = imageLink;
            Description = description;
            CookingTime = cookingTime;
            Ingredients = ingredients;
            Difficulty = difficulty;
        }

        /// <summary>
        /// Retrieves a list of meals based on the specified request and user ID.
        /// </summary>
        /// <param name="request">The request containing meal parameters.</param>
        /// <param name="userId">The user ID to associate with the meal records.</param>
        /// <returns>A list of meals.</returns>
        public static async Task<List<Meal>> GetMeal(MealRequest request, int userId)
        {
            List<Meal> meals = new List<Meal>();
            string recipeJson = await GenerateMealAsync(request);

            var recipeList = JsonConvert.DeserializeObject<List<dynamic>>(recipeJson);

            if (recipeList == null || !recipeList.Any())
            {
                throw new Exception("No meals found in the JSON response.");
            }

            GeneralDBservices dbs = new GeneralDBservices();

            foreach (var recipeObject in recipeList)
            {
                Meal meal = new Meal
                {
                    Name = recipeObject.Name,
                    ImageLink = await GetImageLink((string)recipeObject.Name),
                    Description = recipeObject.Description,
                    CookingTime = Convert.ToInt32(recipeObject.CookingTime),
                    Ingredients = string.Join(", ", recipeObject.Ingredients),
                    Difficulty = recipeObject.difficulty,
                    Instructions = recipeObject.Instructions
                };

                meals.Add(meal);

                dbs.InsertMeal(meal, userId);
            }

            return meals;
        }

        /// <summary>
        /// Generates a list of meals based on the specified meal request.
        /// </summary>
        /// <param name="mealRequest">The request containing meal parameters.</param>
        /// <returns>A JSON string containing the list of meals.</returns>
        public static async Task<string> GenerateMealAsync(MealRequest mealRequest)
        {
            HttpClient client = new HttpClient();
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json").Build();
            string url = $@"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={configuration.GetSection("GeminiApi:APIKey").Value}";
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = $"give me recipes list each recipe contains {mealRequest.Ingredints} and make sure that the recipes is good for people with religion:{mealRequest.Relligion} and allergic to: {mealRequest.Allerges}. at least 5 recipes in the list. Return the result as list of JSON structured recipes like this: {{\"Name\":\"recipe1\",\"ImageLink\":\"image1.jpg\",\"Description\":\"Description of the recipe\",\"CookingTime\":30,\"Ingredients\":[\"ingredient1\",\"ingredient2\",...],\"difficulty\":\"Easy\",\"Instructions\":\"Instructions of the recipe\"}}. Make sure to return it in a single-line JSON format."
                            }
                        }
                    }
                }
            };
            var jsonRequest = JsonConvert.SerializeObject(requestBody);

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                // Extract the JSON string from the response
                var responseObject = JsonConvert.DeserializeObject<dynamic>(responseBody);
                string recipeJson = responseObject.candidates[0].content.parts[0].text.ToString();

                return recipeJson;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating meal: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Generates an image for the meal based on the meal name.
        /// </summary>
        /// <param name="mealName">The name of the meal.</param>
        /// <param name="mealId">The unique identifier of the meal.</param>
        /// <returns>The path to the saved image.</returns>
        private static async Task<string> GenerateImageForTheMeal(string mealName, int mealId)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json").Build();

            var httpClient = new HttpClient();
            var apiUrl = configuration.GetConnectionString("HuggingFaceModel:apiUrl");

            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {configuration.GetConnectionString("HuggingFaceModel:apiKey")}");

            var requestBody = new
            {
                inputs = mealName + "meal"
            };
            var jsonContent = JsonConvert.SerializeObject(requestBody);
            var httpContent = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(apiUrl, httpContent);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsByteArrayAsync();

                string path = System.IO.Directory.GetCurrentDirectory();
                var fileName = $"{mealId}.jpg";
                var filePath = Path.Combine(path, "Images/Meals/" + fileName);

                await SaveImageToFileAsync(result, filePath);
                return "/Images/Meals/" + fileName;
            }
            else
            {
                throw new Exception($"Failed to query API: {response.ReasonPhrase}");
            }
        }

        /// <summary>
        /// Gets the image link for the meal based on its name.
        /// </summary>
        /// <param name="mealName">The name of the meal.</param>
        /// <returns>The URL of the meal image.</returns>
        private static async Task<string> GetImageLink(string mealName)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json").Build();

            var httpClient = new HttpClient();
            var apiUrl = "https://api.unsplash.com/search/photos?query=" + mealName + $"&client_id={configuration.GetSection("UpSplash:Client_id").Value}";
            var response = await httpClient.GetAsync(apiUrl);
            if (response.IsSuccessStatusCode)
            {
                string apiResponse = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<dynamic>(apiResponse);

                if (responseObject.results.Count > 0)
                {
                    string firstImageUrl = responseObject.results[0].urls.small;

                    return firstImageUrl;
                }
                else
                {
                    throw new Exception($"No images found for the meal.");
                }
            }
            else
            {
                throw new Exception($"Failed to query API: {response.ReasonPhrase}");
            }
        }

        /// <summary>
        /// Saves the image data to a file.
        /// </summary>
        /// <param name="imageData">The image data as a byte array.</param>
        /// <param name="filePath">The path to save the image file.</param>
        private static async Task SaveImageToFileAsync(byte[] imageData, string filePath)
        {
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.WriteAsync(imageData, 0, imageData.Length);
            }
            Console.WriteLine($"Image saved to {filePath}");
        }

        /// <summary>
        /// Retrieves the history of meals for a specified user.
        /// </summary>
        /// <param name="userId">The user ID to retrieve meal history for.</param>
        /// <returns>A list of meals for the specified user.</returns>
        public static List<Meal> GetHistoryMeal(int userId)
        {
            GeneralDBservices db = new GeneralDBservices();
            return db.GetMealsForUser(userId);
        }


        /// <summary>
        /// Adds a meal to the user's list of favorites.
        /// </summary>
        /// <param name="mealId">The ID of the meal to add to favorites.</param>
        /// <param name="userId">The ID of the user who is adding the meal to favorites.</param>
        /// <returns>A message indicating the result of the operation.</returns>
        public static string? AddMealToFavorite(int mealId, int userId)
        {
            GeneralDBservices db = new GeneralDBservices();
            return db.AddToFavorite(mealId, userId);
        }

        /// <summary>
        /// Removes a meal from the user's list of favorites.
        /// </summary>
        /// <param name="mealId">The ID of the meal to remove from favorites.</param>
        /// <param name="userId">The ID of the user who is removing the meal from favorites.</param>
        /// <returns>An object indicating the result of the operation.</returns>
        public static object? RemoveMealFromFavorite(int mealId, int userId)
        {
            GeneralDBservices db = new GeneralDBservices();
            return db.RemoveMealFromFavorite(mealId, userId);
        }
    }
}
