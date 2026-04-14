import { redirect } from "next/navigation";

export default function UploadCourseIndex() {
  redirect("/admin/upload-course/new");
}

