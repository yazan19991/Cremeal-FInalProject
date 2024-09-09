USE [igroup237_prod]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   10/8/24
-- Description:   Delete a user and handle related records
-- =============================================

ALTER PROCEDURE [dbo].[spDeleteUser]
    @userId INT,
    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Start a transaction
        BEGIN TRANSACTION;

        -- Decrease the count for each allergen before deletion
        UPDATE allergens
        SET [count] = [count] - 1
        WHERE [id] IN (SELECT allergen_id FROM user_allergens WHERE user_id = @userId);

        -- Delete from user_allergens table
        DELETE FROM user_allergens WHERE user_id = @userId;

        -- Delete the user's meal history
        DELETE FROM meal_history WHERE user_id = @userId;

        -- Delete meals that are no longer referenced by any users
        DECLARE @deletedMealCount INT;

        SET @deletedMealCount = (
            SELECT COUNT(*)
            FROM meal
            WHERE id IN (
                SELECT id
                FROM meal
                WHERE id NOT IN (
                    SELECT meal_id
                    FROM meal_history
                )
            )
        );

        DELETE FROM meal
        WHERE id IN (
            SELECT id
            FROM meal
            WHERE id NOT IN (
                SELECT meal_id
                FROM meal_history
            )
        );

        -- Update the meal count in statistics
        IF @deletedMealCount > 0
        BEGIN
            UPDATE [statistics]
            SET [value] = [value] - @deletedMealCount
            WHERE [statistic_name] = 'Number of the meals';
        END

        -- Delete from reseat_password table
        DELETE FROM reseat_password WHERE user_id = @userId;

        -- Update religion count for the deleted user
        UPDATE [religion]
        SET [count] = [count] - 1
        WHERE [id] = (SELECT [religion_id] FROM [user] WHERE [id] = @userId);

        -- Update the number of users in statistics
        UPDATE [statistics]
        SET [value] = [value] - 1
        WHERE [statistic_name] = 'Number of users';

        -- Set user_id to -1 in the transaction table
        UPDATE [transaction] 
        SET [user_id] = -1 
        WHERE [user_id] = @userId;

        -- Delete from user table
        DELETE FROM [user] WHERE id = @userId;

        -- Commit the transaction
        COMMIT TRANSACTION;

        -- Set success status and message
        SET @statusMessage = 'User deleted successfully.';
        SET @status = 0;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction if an error occurs
        ROLLBACK TRANSACTION;

        -- Set error status and message
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
