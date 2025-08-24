import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { type User } from "../../types/user";
import { CardDetail } from "../organisms/CardDetail";
import { Box, Spinner, Center } from "@chakra-ui/react";

export const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single<User>();

        if (error) {
          console.error("ユーザーデータの取得に失敗しました", error);
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error("予期せぬエラーが発生しました", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>;
  }

  if (!user) {
    return <Box>指定されたユーザーは見つかりませんでした。</Box>;
  }

  return <CardDetail user={user} />;
};
