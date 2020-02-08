export const getFieldsFromObject = (objectMap: Record<string, any>, fields: Array<string>) =>{
    console.log("funkcja ", objectMap);
    return objectMap.map((element: Record<string, any>) => {
        let obj: Record<string, any> = {};
        fields.map((field: string) =>{
            obj[field] = element[field];
        })
        return obj;
    });
}