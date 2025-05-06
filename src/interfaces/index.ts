export interface User{
    Id:number
    Email:string
    FirstName:string
    LastName:string
    Password:string
    Role:string
    CompanyId:number
    Occupation:string
    Department:string
}


export interface DecodedData{
    iat:number,
    role:string
    id:number
}