import { getFileUrls, getMergedFileUrl } from "@/app/utils";
import MessagesSection from "@/components/MessagesSection/MessagesSection";
import PdfViewer from "@/components/PDFViewer/PDFViewer";
import dbConnect from "@/lib/mongodb";

const Chat = async ({ params }: { params: { id: string } }) => {
  await dbConnect();

  const fileUrl = await getMergedFileUrl(params.id);

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
      <PdfViewer url={fileUrl} />
    </div>
  );
};

export default Chat;
