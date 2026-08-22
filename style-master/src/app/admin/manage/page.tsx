import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ManageClient } from "./manage-client";

export default function ManageProductsPage() {
  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>상품 관리</CardTitle>
          <CardDescription>
            등록된 상품의 정보를 수정하거나 삭제합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManageClient />
        </CardContent>
      </Card>
    </div>
  );
}
