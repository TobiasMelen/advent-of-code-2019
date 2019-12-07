export default function relativePath(rootImportPath: string, path: string){
    return `${new URL(rootImportPath).pathname}/../${path}`
}