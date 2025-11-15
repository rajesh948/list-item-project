import { h, render } from 'vue';

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 5000) => {
    // Dynamically import the toast component
    import('~/components/toast/index.vue').then((ToastComponent) => {
      // Create a container for the toast
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Create the toast component
      const vnode = h(ToastComponent.default, {
        message,
        type,
        duration,
      });

      // Render the component
      render(vnode, container);

      // Show the toast
      if (vnode.component?.exposed) {
        vnode.component.exposed.show();
      }

      // Clean up after animation completes
      setTimeout(() => {
        render(null, container);
        document.body.removeChild(container);
      }, duration + 500); // Extra time for exit animation
    });
  };

  return {
    showToast,
  };
}
