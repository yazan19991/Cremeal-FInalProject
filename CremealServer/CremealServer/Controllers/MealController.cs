using Microsoft.AspNetCore.Mvc;
using CremealServer.Models;
using CremealServer.Models.DAL;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CremealServer.Models.Requests;
using CremealServer.Models.Services;

namespace CremealServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User")]
    public class MealController : Controller
    {
        /// <summary>
        /// Retrieves meals based on the user's request and their coin balance.
        /// </summary>
        /// <param name="request">The meal request details provided by the user.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the list of meals if the retrieval is successful, or an appropriate error message.
        /// </returns>
        /// <response code="200">Returns the list of meals if the request is successfully processed and the user has sufficient coins.</response>
        /// <response code="400">Returns an error message if the user does not have sufficient coins to generate meals or if there is a bad request.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the meal retrieval process.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMeal([FromBody] MealRequest request)
        {
            OurLogger logger = OurLogger.Instance;
            int userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));
            try
            {
                logger.LogInfo($"Received meal request from user ID: {userId}.");

                GeneralDBservices db = new GeneralDBservices();

                if (db.UseOneCoin(userId))
                {
                    var meals = await Meal.GetMeal(request, userId);

                    logger.LogInfo($"Meals successfully retrieved for user ID: {userId}.");
                    return Ok(meals);
                }
                else
                {
                    logger.LogWarning($"User ID: {userId} does not have sufficient coins to generate meals.");
                    return BadRequest("You do not have permission to generate meals. Check your coins.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"An error occurred while retrieving meals for user ID: {userId} - Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving meals.");
            }
        }


        /// <summary>
        /// Adds a specified meal to the user's list of favorite meals.
        /// </summary>
        /// <param name="mealId">The ID of the meal to be added to the favorites.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the operation.
        /// </returns>
        /// <response code="200">Returns a success message if the meal is successfully added to favorites.</response>
        /// <response code="400">Returns an error message if there is a bad request or invalid meal ID.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the process.</response>
        [HttpPost("AddToFavorite")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult AddToFavorite([FromQuery] int mealId)
        {
            OurLogger logger = OurLogger.Instance;

            int userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));

            try
            {
                logger.LogInfo($"User ID: {userId} is attempting to add meal ID: {mealId} to favorites.");

                var result = Meal.AddMealToFavorite(mealId, userId);

                logger.LogInfo($"Meal ID: {mealId} successfully added to favorites by user ID: {userId}.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError($"An error occurred while adding meal ID: {mealId} to favorites for user ID: {userId} - Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        /// <summary>
        /// Retrieves the meal history for the authenticated user.
        /// </summary>
        /// <returns>
        /// An <see cref="IActionResult"/> containing the meal history or an error message.
        /// </returns>
        /// <response code="200">Returns the meal history for the user if the request is successful.</response>
        /// <response code="400">Returns an error message if there is a bad request, such as an invalid user ID.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the retrieval process.</response>
        [HttpGet("GetMealHistory")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetMealHistory()
        {
            OurLogger logger = OurLogger.Instance;

            int userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));

            try
            {
                logger.LogInfo($"Fetching meal history for user ID: {userId}.");

                var mealHistory = Meal.GetHistoryMeal(userId);

                logger.LogInfo($"Successfully retrieved meal history for user ID: {userId}.");
                return Ok(mealHistory);
            }
            catch (Exception ex)
            {
                logger.LogError($"An error occurred while retrieving meal history for user ID: {userId} - Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }



        /// <summary>
        /// Removes a meal from the authenticated user's favorites.
        /// </summary>
        /// <param name="mealId">The ID of the meal to be removed from favorites.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the removal attempt.
        /// </returns>
        /// <response code="200">Returns a success message if the meal was successfully removed from favorites.</response>
        /// <response code="400">Returns an error message if the meal was not found in the user's favorites or if the request is invalid.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the removal process.</response>
        [HttpDelete("RemoveFromFavorite")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult RemoveFromFavorite([FromQuery]  int mealId)
        {
            OurLogger logger = OurLogger.Instance;

            int userId = Convert.ToInt32(HttpContext.User.FindFirstValue("id"));

            try
            {
                logger.LogInfo($"Attempting to remove meal ID {mealId} from user ID {userId}'s favorites.");

                object result = Meal.RemoveMealFromFavorite(mealId, userId);

                if (result != null)
                {
                    logger.LogInfo($"Successfully removed meal ID {mealId} from user ID {userId}'s favorites.");
                    return Ok("Meal removed from favorites.");
                }
                else
                {
                    logger.LogWarning($"Meal ID {mealId} was not found in user ID {userId}'s favorites.");
                    return BadRequest("Meal not found in favorites.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                logger.LogError($"An error occurred while removing meal ID {mealId} from user ID {userId}'s favorites - Exception: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

    }
}
