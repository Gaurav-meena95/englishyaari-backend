import {Response} from "express";
export const sendSuccess = <T>(
    res:Response,
    statusCode: number,
    message: string,
    data?: T
):Response=>{
    return res.status(statusCode).json({
        success:true,
        statusCode,
        message,
        data:data ?? null,
        
    })
}