import { useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthScaffold } from '@/components/auth/AuthScaffold'
import { PasswordChecklist } from '@/components/auth/PasswordChecklist'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { AppText } from '@/components/ui/AppText'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useSignUp } from '@/auth/hooks/useSignUp'
import { signUpSchema, type SignUpValues } from '@/auth/schemas'
import { failureHaptic } from '@/auth/hooks/shared'

export default function SignUpScreen() {
  const { loading, submit } = useSignUp()
  const [formError, setFormError] = useState<string | null>(null)
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null)
  const nameRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const { control, handleSubmit, setError, formState: { errors } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (values: SignUpValues) => {
    setFormError(null)
    setDuplicateEmail(null)
    const result = await submit(values)
    if (result.error) {
      if (result.error.kind === 'field' && result.error.field === 'email') {
        setDuplicateEmail(values.email)
        setError('email', { message: result.error.message })
      } else if (result.error.kind === 'form') setFormError(result.error.message)
      return
    }
  }

  return (
    <AuthScaffold title="Create your account" subtitle="Your personal AI dietitian starts here.">
      <View style={styles.form}>
        {formError ? <Banner tone="error" message={formError} /> : null}
        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={nameRef}
            label="Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )} />
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
            label="Email"
            value={value}
            onChangeText={(text) => { onChange(text); setDuplicateEmail(null) }}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )} />
        {duplicateEmail ? (
          <Pressable accessibilityRole="link" onPress={() => router.replace({ pathname: '/sign-in', params: { email: duplicateEmail } })}>
            <AppText variant="link" tone="gold">Sign in instead</AppText>
          </Pressable>
        ) : null}
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            ref={passwordRef}
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={() => { void handleSubmit(onSubmit, () => void failureHaptic())() }}
          />
        )} />
        <PasswordChecklist password={password} />
        <Button label="Create account" loading={loading} onPress={() => { void handleSubmit(onSubmit, () => void failureHaptic())() }} />
        <Divider />
        <SocialAuthButtons compact onError={setFormError} />
        <View style={styles.footer}>
          <AppText variant="body" tone="muted">Already have an account? </AppText>
          <Pressable accessibilityRole="link" onPress={() => router.replace('/sign-in')}><AppText variant="link" tone="gold">Sign in</AppText></Pressable>
        </View>
      </View>
    </AuthScaffold>
  )
}

const styles = StyleSheet.create({ form: { gap: 16 }, footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 48 } })
