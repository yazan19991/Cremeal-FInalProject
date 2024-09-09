USE [igroup237_prod]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Khaled Khalaf
-- Create date: 23/4/24
-- Description:	Insert new user into the user table
-- =============================================
ALTER PROCEDURE [dbo].[spInsertUser]
    @UserName varchar(255),
    @UserEmail varchar(255),
    @Password varchar(255),
    @Allergic nvarchar(255) = '0',
    @ReligionId int = 1,
    @StatusMessage varchar(255) OUTPUT,
    @Status bit OUTPUT -- 0 indicates no errors, 1 indicates errors
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Start transaction
        BEGIN TRANSACTION;

        -- Check if the email is already registered
        IF EXISTS (SELECT 1 FROM [user] WHERE [user_email] = @UserEmail)
        BEGIN
            SET @StatusMessage = 'Use another email please';
            SET @Status = 1;
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        DECLARE @CurrentTime DATETIME = GETDATE();
        DECLARE @HaveHistory BIT = 0;

        -- Insert the user into the table
        INSERT INTO [user] ([user_name], [user_email], [verfied_forReset], [password], [religion_id], [first_created_time], [last_update_time])
        VALUES (@UserName, @UserEmail, 0, @Password, @ReligionId, @CurrentTime, @CurrentTime);

        -- Update the religion count
        UPDATE [religion]
        SET [count] += 1
        WHERE [id] = @ReligionId;

        -- Retrieve the ID of the newly inserted user
        DECLARE @UserId INT = SCOPE_IDENTITY();

        -- Insert allergens
        DECLARE @statusMessage2 NVARCHAR(255);
        DECLARE @status2 BIT;

        EXEC spInsertAllergics 
            @allergic_ids = @Allergic, 
            @user_id = @UserId,
            @statusMessage = @statusMessage2 OUTPUT,
            @status = @status2 OUTPUT;

        IF @status2 = 1 
        BEGIN
            -- If there's an error with allergens, undo the changes
            -- Decrement the religion count
            UPDATE [religion]
            SET [count] -= 1
            WHERE [id] = @ReligionId;

            -- Rollback the transaction
            ROLLBACK TRANSACTION;

            THROW 51000, @statusMessage2, 1;
        END;

        -- Update statistics to add new user
        UPDATE [statistics]
        SET [value] += 1
        WHERE [id] = 1;

        -- Commit the transaction if everything is successful
        COMMIT TRANSACTION;

        SET @StatusMessage = 'Registered successfully';
        SET @Status = 0;

        -- Return the ID of the newly inserted user
        SELECT @UserId AS 'InsertedUserId';
    END TRY
    BEGIN CATCH
        -- Rollback the transaction in case of any error
        ROLLBACK TRANSACTION;

        -- Decrement the religion count if the user was inserted
        IF @@TRANCOUNT > 0
        BEGIN
            UPDATE [religion]
            SET [count] -= 1
            WHERE [id] = @ReligionId;

			UPDATE [statistics]
			SET [value] -= 1
			WHERE [id] = 1;
        END;

        -- Set error message and status
        SET @StatusMessage = ERROR_MESSAGE();
        SET @Status = 1;
        RETURN;
    END CATCH
END
