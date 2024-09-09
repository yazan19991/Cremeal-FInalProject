USE [igroup237_prod]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   1/8/24
-- Description:   Remove a meal from the user's favorites by updating the favorit column
-- =============================================
CREATE PROCEDURE [dbo].[spRemoveMealFromFavorite]
    @UserId INT,
    @MealId INT,
    @statusMessage VARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Check if the user exists
        IF NOT EXISTS (SELECT 1 FROM [user] WHERE [id] = @UserId)
        BEGIN
            SET @statusMessage = 'User does not exist';
            SET @status = 1;
            RETURN;
        END;

        -- Check if the meal exists
        IF NOT EXISTS (SELECT 1 FROM [meal] WHERE [id] = @MealId)
        BEGIN
            SET @statusMessage = 'Meal does not exist';
            SET @status = 1;
            RETURN;
        END;

        -- Update the meal history favorit column to 0 (remove from favorites)
        UPDATE [meal_history]
        SET [favorit] = 0
        WHERE [user_id] = @UserId AND [meal_id] = @MealId;

        -- Check if the update was successful
        IF @@ROWCOUNT > 0
        BEGIN
            SET @statusMessage = 'Meal removed from favorites successfully';
            SET @status = 0;
        END
        ELSE
        BEGIN
            SET @statusMessage = 'Meal not found in favorites or already removed';
            SET @status = 1;
        END;
    END TRY
    BEGIN CATCH
        -- Capture and report any errors
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
