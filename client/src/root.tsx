import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AirtableProvider } from '@/providers'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { HeaderComponent } from '@/components/Header'


export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link rel="icon" type="image/png" href="/ela.png" />
        <title>Equal Legal Aid</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          <AirtableProvider>
            <div className="app mx-auto my-0 w-full xl:max-w-315">
              <HeaderComponent />
              <main className="main-content px-4 xl:px-0">
                {children}
              </main>
            </div>
          </AirtableProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}