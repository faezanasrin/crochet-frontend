# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Customer orders and admin access

Customer sign-in uses the Spring Boot `/api/auth/login` endpoint. After signing in, **Track Order** lists only the signed-in customer’s orders. New orders are attached to the authenticated account by the backend.

Admin access is checked by the Spring Boot API. Set the `ADMIN_PASSWORD` environment variable before starting the backend. In PowerShell:

```powershell
Set-Location "C:\Users\faeza\Downloads\shop\shop"
$env:ADMIN_PASSWORD = "choose-a-strong-password"
.\mvnw.cmd spring-boot:run
```

Admin and customer access tokens expire after 12 hours and are held in memory by the backend, so restarting the backend signs everyone out. Customer passwords are stored as BCrypt hashes; existing plaintext passwords are upgraded to BCrypt when those customers next sign in. The backend must be running for login, checkout, tracking, and admin access.

## Contact form email delivery

The footer contact form sends signed-in customers' messages through Web3Forms to `yarn.diary.studio@gmail.com`, without opening an email app or requiring SMTP credentials on the backend.

1. Create a free access key at [web3forms.com](https://web3forms.com/) using `yarn.diary.studio@gmail.com`. Web3Forms emails the access key to that address.
2. Copy `.env.example` to `.env.local` in the frontend project root and replace the placeholder value for `VITE_WEB3FORMS_ACCESS_KEY` with your access key.
3. Restart the Vite development server so it loads the new environment variable.
4. For production, add `VITE_WEB3FORMS_ACCESS_KEY` to the Vercel project's Environment Variables for the Production environment, then redeploy.

The access key is intended for use in browser forms. Do not put SMTP passwords or other private credentials in `VITE_` variables. See [Web3Forms installation docs](https://docs.web3forms.com/getting-started/installation) for details.

## UPI payments

Checkout generates a UPI QR code and an `upi://pay` link for the full order amount, using the merchant UPI ID configured in `src/components/CheckoutModal.jsx`. Customers enter the UTR after paying. This is a manual transfer flow, not a payment gateway: the backend marks UPI orders as pending, and the admin must verify the transfer in GPay and select **Confirm UPI payment** in the order dashboard. Update `UPI_ID` in the checkout component if the receiving UPI ID changes.

## Admin product inventory

Sign in at `/admin` and choose **Inventory / Add Product** to add, edit, delete, or mark products in/out of stock. Product create/update/delete endpoints require the admin bearer session. Out-of-stock items remain listed but cannot be added to the basket. New categories are automatically added to the shop category filters.

## Customer reviews

Product pages show public star ratings and reviews. Signed-in customers can post one review for a product after an admin marks an order containing that product as **Delivered**. Review eligibility is checked by the backend against the signed-in customer's order history.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
