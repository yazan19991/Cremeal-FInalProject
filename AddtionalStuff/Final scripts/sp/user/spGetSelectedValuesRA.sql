USE [igroup237_prod]
GO
/****** Object:  StoredProcedure [dbo].[spInsertAllergics]    Script Date: 8/10/2024 11:06:24 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   4/8/24
-- upadted date : 10/8/24
-- Description:   Insert or update allergens for users
-- =============================================

ALTER PROCEDURE [dbo].[spInsertAllergics]
    @allergic_ids NVARCHAR(MAX), -- id,id,id.....
    @user_id INT,

    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Start transaction
        BEGIN TRANSACTION;

		-- Decrease the count for each allergen before deletion
		UPDATE allergens
		SET [count] = [count] - 1
		WHERE [id] IN (SELECT [allergen_id] FROM user_allergens WHERE [user_id] = @user_id);

        -- Delete existing allergens for the user
        DELETE FROM user_allergens
        WHERE [user_id] = @user_id;

        -- Insert new allergens
        DECLARE @Value INT;
        DECLARE allergen_cursor CURSOR FOR  
        SELECT CAST(value AS INT) 
        FROM STRING_SPLIT(@allergic_ids, ','); 

        OPEN allergen_cursor;  
        FETCH NEXT FROM allergen_cursor INTO @Value;  
        
        WHILE @@FETCH_STATUS = 0  
        BEGIN  
            BEGIN TRY 
                INSERT INTO user_allergens ([user_id], allergen_id)
                VALUES (@user_id, @Value);

				-- update the statistics for count the allergics
				Update allergens
				set [count] += 1
				where [id] = @Value

            END TRY
            BEGIN CATCH 
                ---- Capture the error message
                --SET @statusMessage = ERROR_MESSAGE();
                --SET @status = 1;

                ---- Rollback transaction and exit
                --ROLLBACK TRANSACTION;

                ---- Undo the count decrement
                --UPDATE allergens
                --SET [count] = [count] + 1
                --WHERE [id] IN (SELECT [allergen_id] FROM user_allergens WHERE [user_id] = @user_id);

                --CLOSE allergen_cursor;
                --DEALLOCATE allergen_cursor;

                --RETURN; 
            END CATCH 
            
            FETCH NEXT FROM allergen_cursor INTO @Value;
        END;  

        CLOSE allergen_cursor;  
        DEALLOCATE allergen_cursor;  

        -- Commit transaction
        COMMIT TRANSACTION;

        SET @statusMessage = 'Allergens updated successfully.';
        SET @status = 0;
    END TRY
    BEGIN CATCH
        -- Rollback transaction in case of error
        ROLLBACK TRANSACTION;
        
        -- Ensure cursor is cleaned up
        BEGIN TRY
            CLOSE allergen_cursor;  
            DEALLOCATE allergen_cursor;
        END TRY
        BEGIN CATCH 
            -- Handle any error during cursor cleanup
        END CATCH

        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
