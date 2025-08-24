import { useParams } from "react-router-dom";
import { CardDetail } from "../organisms/CardDetail";

export const CardDetailPage = () => {
  // URLから :id パラメータを取得
  const { id } = useParams<{ id: string }>();

  // idが存在しない場合の考慮（実際はエラーページなどに飛ばす）
  if (!id) {
    return <div>IDが指定されていません。</div>;
  }

  // 取得したidをOrganismに渡す
  return <CardDetail cardId={id} />;
};
