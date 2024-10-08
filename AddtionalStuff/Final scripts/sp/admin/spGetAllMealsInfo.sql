USE [igroup237_prod]
GO
/****** Object:  StoredProcedure [dbo].[spGetAllMealsInfo]    Script Date: 8/10/2024 3:08:33 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Khaled Khalaf
-- Create date: 21/5/24
-- Description:	get all the meals from the system 
-- =============================================
create PROCEDURE [dbo].[spGetAllMealsInfo] 
	@statusMessage nvarchar(255) output ,
	@status bit output
AS
BEGIN
	SET NOCOUNT ON;
	begin try 
		set @statusMessage = 'Loaded info successfuly'
		set @status = 0
		select * from [meal]
	end try 
	begin catch 
		set @statusMessage = 'Something went wrong'
		set @status = 1
	end catch 

END
