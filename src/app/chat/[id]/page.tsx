import { getFileUrls } from "@/app/utils";
import MessagesSection from "@/components/MessagesSection/MessagesSection";
import PdfViewer from "@/components/PDFViewer/PDFViewer";
import dbConnect from "@/lib/mongodb";

const Chat = async ({ params }: { params: { id: string } }) => {
  await dbConnect();

  const fileUrls = await getFileUrls(params.id);

  console.log("fileUrl", fileUrls);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "2rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        // gridTemplateColumns: "1fr 1fr",
      }}
    >
      <MessagesSection params={params} />
      <PdfViewer url={fileUrls[0]} />
    </div>
  );
};

export default Chat;
