using System.Drawing;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace CremealServer.Models
{


    public interface IModelPredictor
    {
        Task<HashSet<string>> PredictAsync(Bitmap image);
    }

    public class ModelPredictor : IModelPredictor
    {
        private List<string> classNames = new List<string>
        {
            "Apple", "Grape", "Pear", "Strawberry", "Tomato", "Lemon", "Banana", "Orange",
            "Peach", "Mango", "Pineapple", "Grapefruit", "Pomegranate", "Watermelon",
            "Cantaloupe", "Cucumber", "Radish", "Artichoke", "Potato", "Asparagus", "Pumpkin",
            "Zucchini", "Cabbage", "Carrot", "Salad", "Broccoli", "Bell pepper", "Winter melon",
            "Honeycomb"
        };

        private readonly InferenceSession session;
        // Class names from the model metadata


        public ModelPredictor(string modelPath)
        {
            // Load the ONNX model only once
            session = new InferenceSession(modelPath);
        }

        public async Task<HashSet<string>> PredictAsync(Bitmap image)
        {
            // Preprocess the image and convert it to a tensor
            var inputImage = PreprocessImage(image);
            // Define input and output names
            var inputMeta = session.InputMetadata;
            var outputMeta = session.OutputMetadata;
            var inputName = inputMeta.Keys.First();
            var outputName = outputMeta.Keys.First();

            // Run inference
            var inputs = new List<NamedOnnxValue> { NamedOnnxValue.CreateFromTensor(inputName, inputImage) };
            using var results = session.Run(inputs);

            // Get raw output
            var output = results.First().AsTensor<float>().ToDenseTensor();

            // Post-process results
            var (boxes, classIds, confidences) = PostprocessResults(output);

            // Filter out low-confidence detections
            var confidenceThreshold = 0.5f;
            var highConfidenceIndices = confidences.Select((value, index) => new { Value = value, Index = index })
                                                   .Where(x => x.Value > confidenceThreshold)
                                                   .Select(x => x.Index)
                                                   .ToList();

            var filteredBoxes = highConfidenceIndices.Select(i => boxes[i]).ToList();
            var filteredClassIds = highConfidenceIndices.Select(i => classIds[i]).ToList();
            var filteredConfidences = highConfidenceIndices.Select(i => confidences[i]).ToList();

            // Map class indices to class names and ensure uniqueness
            var detectedLabels = new HashSet<string>(filteredClassIds.Select(id => classNames[id]));

            return detectedLabels;
        }

        static (List<float[]> boxes, List<int> classIds, List<float> confidences) PostprocessResults(DenseTensor<float> output)
        {
            var boxes = new List<float[]>();
            var classIds = new List<int>();
            var confidences = new List<float>();

            var numBoxes = output.Dimensions[2];

            for (int i = 0; i < numBoxes; i++)
            {
                var box = new float[4];
                for (int j = 0; j < 4; j++)
                {
                    box[j] = output[0, j, i];
                }
                boxes.Add(box);

                var classProbs = new float[output.Dimensions[1] - 4];
                for (int j = 0; j < classProbs.Length; j++)
                {
                    classProbs[j] = output[0, 4 + j, i];
                }

                var maxClassProb = classProbs.Max();
                var classId = Array.IndexOf(classProbs, maxClassProb);

                classIds.Add(classId);
                confidences.Add(maxClassProb);
            }

            return (boxes, classIds, confidences);
        }


        private static DenseTensor<float> PreprocessImage(Bitmap imagePath)
        {
            var bitmap = new Bitmap(imagePath);
            var resizedBitmap = new Bitmap(bitmap, new Size(640, 640));
            var tensor = new DenseTensor<float>(new[] { 1, 3, 640, 640 });

            for (int y = 0; y < resizedBitmap.Height; y++)
            {
                for (int x = 0; x < resizedBitmap.Width; x++)
                {
                    var pixel = resizedBitmap.GetPixel(x, y);
                    tensor[0, 0, y, x] = pixel.R / 255.0f;
                    tensor[0, 1, y, x] = pixel.G / 255.0f;
                    tensor[0, 2, y, x] = pixel.B / 255.0f;
                }
            }

            return tensor;
        }

     
    }
}
