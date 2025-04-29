export interface User{
    Id:number
    Email:string
    FirstName:string
    LastName:string
    Password:string
    Role:string
    CompanyId:number
}


export interface DecodedData{
    iat:number,
    role:string
    id:number
}