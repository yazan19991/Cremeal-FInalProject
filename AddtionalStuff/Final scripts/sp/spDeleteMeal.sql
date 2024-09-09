CREATE PROCEDURE [dbo].[spDeleteMeal]
    @mealId INT,
    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Start a transaction
        BEGIN TRANSACTION;

        -- Check if the meal exists
        IF EXISTS (SELECT 1 FROM meal WHERE id = @mealId)
        BEGIN
            -- Delete from meal_history table
            DELETE FROM meal_history WHERE meal_id = @mealId;

            -- Delete the meal from the meal table
            DELETE FROM meal WHERE id = @mealId;

            -- Update the meal count in statistics
            UPDATE [statistics]
            SET [value] = [value] - 1
            WHERE [statistic_name] = 'Number of the meals';

            -- Commit the transaction
            COMMIT TRANSACTION;

            -- Set success status and message
            SET @statusMessage = 'Meal deleted successfully.';
            SET @status = 0;
        END
        ELSE
        BEGIN
            -- If the meal does not exist
            SET @statusMessage = 'Meal not found.';
            SET @status = 1;
        END
    END TRY
    BEGIN CATCH
        -- Rollback the transaction if an error occurs
        ROLLBACK TRANSACTION;

        -- Set error status and message
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
