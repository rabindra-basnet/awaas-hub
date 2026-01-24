import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  email: string;
  name: string | undefined | null;
  url: string;
}

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { name, url, email } = props;

  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>Reset your password - Action required</Preview>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-xl bg-white p-10 shadow-sm">
            {/* Header */}
            <Section className="mb-8 text-center">
              <Heading className="m-0 mb-2 font-bold text-[28px] text-gray-900">
                Reset Your Password
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                We received a request to reset your password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Text className="m-0 mb-4 text-[16px] text-gray-700 leading-6">
                Hello, {name}
              </Text>
              <Text className="m-0 mb-4 text-[16px] text-gray-700 leading-6">
                We received a password reset request for your account associated
                with <strong>{email}</strong>.
              </Text>
              <Text className="m-0 mb-6 text-[16px] text-gray-700 leading-6">
                Click the button below to create a new password. This link will
                expire in 24 hours for security reasons.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="mb-8 text-center">
              <Button
                className="box-border inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold text-[16px] text-white no-underline"
                href={url}
              >
                Reset Password
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-8">
              <Text className="m-0 mb-2 text-[14px] text-gray-600 leading-5">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Link className="break-all text-[14px] text-blue-600" href={url}>
                {url}
              </Link>
            </Section>

            {/* Security Notice */}
            <Section className="mb-[32px] rounded-[8px] bg-gray-50 p-[20px]">
              <Text className="m-0 mb-[8px] font-semibold text-[14px] text-gray-700 leading-[20px]">
                Security Notice:
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                • If you didn&apos;t request this password reset, please ignore
                this email
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] text-gray-600 leading-[20px]">
                • This link will expire in 24 hours
              </Text>
              <Text className="m-0 text-[14px] text-gray-600 leading-[20px]">
                • For security, never share this link with anyone
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="mb-[32px]">
              <Text className="m-0 text-[14px] text-gray-600 leading-[20px]">
                Need help? Contact our support team at{" "}
                <Link
                  className="text-blue-600"
                  href="mailto:support@company.com"
                >
                  support@company.com
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-gray-200 border-t pt-[24px]">
              <Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
                This email was sent to {email}
              </Text>
              <Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
                Company Name, 123 Business Street, City, State 12345
              </Text>
              <Text className="m-0 text-[12px] text-gray-500 leading-[16px]">
                © 2025 Company Name. All rights reserved.{" "}
                <Link className="text-gray-500" href="#">
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
