// web rout will be : http://localhost:3000/api/test
// Algo-psudocode Notion: https://shorturl.at/dlfFQ

export async function GET(request: Request) {
  return Response.json(
    {
      success: true,
      message: "Route Testing Successfull",
    },
    { status: 200 }
  );
}
