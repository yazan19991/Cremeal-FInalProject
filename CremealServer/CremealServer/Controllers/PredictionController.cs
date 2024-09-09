using Microsoft.AspNetCore.Mvc;
using CremealServer.Models;
using System.Drawing;
using Microsoft.AspNetCore.Authorization;
using CremealServer.Models.Services;

namespace CremealServer.Controllers
{
    /// <summary>
    /// Controller for handling image prediction requests.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class PredictionController : Controller
    {
        private readonly IModelPredictor modelPredictor;

        /// <summary>
        /// Initializes a new instance of the <see cref="PredictionController"/> class.
        /// </summary>
        /// <param name="modelPredictor">The model predictor service used for making predictions from images.</param>
        public PredictionController(IModelPredictor modelPredictor)
        {
            this.modelPredictor = modelPredictor;
        }

        /// <summary>
        /// Processes an uploaded image file to predict objects present in the image.
        /// </summary>
        /// <param name="file">The image file to be analyzed. The file should be in a supported image format (e.g., JPEG, PNG).</param>
        /// <returns>An IActionResult indicating the result of the prediction attempt.</returns>
        /// <response code="200">Returns a <see cref="PredictionResult"/> if the image is successfully processed and predictions are made.</response>
        /// <response code="400">Returns an error message if the uploaded file is invalid or if the file length is zero.</response>
        /// <response code="500">Returns an internal server error message if an error occurs during processing.</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Predict(IFormFile file)
        {
            if (file.Length > 0)
            {
                try
                {
                    using var imageStream = file.OpenReadStream();
                    using var bitmap = new Bitmap(imageStream);
                    var result = await modelPredictor.PredictAsync(bitmap);
                    return Ok(result);
                }
                catch (Exception ex)
                {
                    OurLogger.Instance.LogError($"Error in Predict: {ex.Message}");
                    return StatusCode(500, "Internal server error.");
                }
            }
            return BadRequest("Invalid image file.");
        }
    }


}
