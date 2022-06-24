import { useState } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';


//baseado nesse artigo https://cloudcoders.xyz/blog/nextauth-credentials-provider-with-external-api-and-login-page
export default function SignIn({ csrfToken }) {
  const router = useRouter();
  const [error, setError] = useState(null);

  return (
    <>
      <Formik
        initialValues={{ email: 'fabiano@arpainformatica.com.br', password: 'Arpa2010', tenantKey: '12' }}
        validationSchema={Yup.object({
          email: Yup.string()
            .max(50, 'menos de 50 caracteres')
            .email('email invalido')
            .required('preencher o email'),
          password: Yup.string().required('preencher a senha'),
          tenantKey: Yup.string()
            .max(20, 'maximo de 20 caracteres')
            .required('preencher a empresa'),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const res = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
            tenantKey: values.tenantKey,
            callbackUrl: `${window.location.origin}`,
          });
          if (res?.error) {
            setError(res.error);
          } else {
            setError(null);
          }
          if (res.url) router.push(res.url);
          setSubmitting(false);
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <div className="bg-grey-400 flex flex-col items-center justify-center min-h-screen py-2 shadow-lg">
              <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />

                <div className="text-red-400 text-md text-center rounded p-2">
                  {error}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="uppercase text-sm text-gray-600 font-bold"
                  >
                    Email
                    <Field
                      name="email"
                      aria-label="email"
                      aria-required="true"
                 
                      type="text"
                      className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    />
                  </label>

                  <div className="text-red-600 text-sm">
                    <ErrorMessage name="email" />
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="uppercase text-sm text-gray-600 font-bold"
                  >
                    Senha
                    <Field
                      name="password"
                      aria-label="digite a senha"
          
                      aria-required="true"
                      type="password"
                      className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    />
                  </label>

                  <div className="text-red-600 text-sm">
                    <ErrorMessage name="password" />
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="tenantKey"
                    className="uppercase text-sm text-gray-600 font-bold"
                  >
                    Tenant
                    <Field
                      name="tenantKey"
                      aria-label="Tenant"
  
                      aria-required="true"
                      type="text"
                      className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                    />
                  </label>

                  <div className="text-red-600 text-sm">
                    <ErrorMessage name="tenantKey" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    type="submit"
                    className="uppercase text-sm font-bold tracking-wide bg-green-400 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:shadow-xl active:scale-90 transition duration-150"
                  >
                    {formik.isSubmitting ? 'logando...' : 'Entrar'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
}

 
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
