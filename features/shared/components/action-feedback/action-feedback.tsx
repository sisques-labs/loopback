type ActionFeedbackProps = {
  variant: "success" | "error" | "info"
  message: string
}

const styles = {
  success: "rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300",
  error:   "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300",
  info:    "rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300",
} as const

export function ActionFeedback({ variant, message }: ActionFeedbackProps) {
  return <p className={styles[variant]}>{message}</p>
}
