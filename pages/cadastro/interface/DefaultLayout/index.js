import { Header, PageLayout, Text } from "@primer/react";
import Head from "next/head";
import styles from "./index.module.css";

const contentWidthClasses = {
  small: styles.smallContent,
};

export default function DefaultLayout({
  children,
  metadata = {},
  contentWidth,
}) {
  const extraContentWidth = contentWidthClasses[contentWidth];
  return (
    <>
      <Head>
        <title>
          {metadata.title ? `${metadata.title} • CoffeeTab` : "CoffeeTab"}
        </title>
        {metadata.description && (
          <meta name="description" value={metadata.description} />
        )}
      </Head>

      <Header>
        <Header.Item full>
          <Header.Link href="/">CoffeeTab</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/login">Login</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>

      <PageLayout>
        <PageLayout.Content width={contentWidth} className={extraContentWidth}>
          {children}
        </PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small">© {new Date().getFullYear()} CoffeeTab</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
