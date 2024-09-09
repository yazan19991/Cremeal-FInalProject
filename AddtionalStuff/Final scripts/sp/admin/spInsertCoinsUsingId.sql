USE [igroup237_prod]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Khaled Khalaf
-- Create date: 26/4/24
-- Description:	insert coins to the user using id
-- =============================================
create PROCEDURE [dbo].[spInsertCoinsUsingId]
	@userId int = null ,
	@planId int,

	@statusMessage nvarchar(255) output ,
	@status bit output
AS
BEGIN
	SET NOCOUNT ON;

	begin try
	declare @numberOfCoins int = (select [coins_amount] from [plan] where [id] = @planId)
	
	if (@numberOfCoins != 0) 
	begin
		update [user]
		set [coins] = [coins]  + @numberOfCoins
		where [id] = @userId

		set @statusMessage = 'Updated coins'
		set @status = 0
	end
	else 
	begin
		set @statusMessage = 'Somthing went wrong check inserted values'
		set @status = 1
	end
	end try
	begin catch 
		set @statusMessage = ERROR_MESSAGE()
		set @status = 1
	end catch 

    
END
