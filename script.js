document.addEventListener('DOMContentLoaded', () => {
  const cliInput = document.getElementById('cli-input');
  const terminalBody = document.querySelector('.terminal-body');
  
  let orderState = {
    step: 0,
    type: '',
    size: '',
    pizza: '',
    email: '',
    orderId: ''
  };

  const pizzaMenu = {
    veg: {
      'margherita': 12.99,
      'mushroom supreme': 14.99,
      'veggie paradise': 15.99,
      'garden delight': 13.99
    },
    nonveg: {
      'pepperoni': 14.99,
      'chicken supreme': 16.99,
      'meat lovers': 17.99,
      'bbq chicken': 15.99
    }
  };

  const pizzaSizes = {
    small: 1,
    medium: 1.2,
    large: 1.4
  };

  const commands = {
    help: () => `Available commands:
  - help: Show this help message
  - order pizza: Start a new pizza order
  - menu: Show pizza menu with prices
  - clear: Clear the terminal
  - cancel: Cancel current order
  - track order: Track your order status`,
    
    'order pizza': () => {
      orderState = { step: 1, type: '', size: '', pizza: '', email: '', orderId: '' };
      return `Starting pizza order...
What type of pizza would you like?
1. Vegetarian
2. Non-vegetarian

Type 'veg' or 'nonveg' to select:`;
    },
    
    menu: () => {
      let menuText = 'PIZZA MENU\n\nVegetarian Pizzas:\n';
      for (const [pizza, price] of Object.entries(pizzaMenu.veg)) {
        menuText += `  ${pizza.charAt(0).toUpperCase() + pizza.slice(1)}: $${price}\n`;
      }
      menuText += '\nNon-Vegetarian Pizzas:\n';
      for (const [pizza, price] of Object.entries(pizzaMenu.nonveg)) {
        menuText += `  ${pizza.charAt(0).toUpperCase() + pizza.slice(1)}: $${price}\n`;
      }
      menuText += '\nSize Multipliers:\n';
      menuText += '  Small: Base price\n  Medium: +20%\n  Large: +40%';
      return menuText;
    },

    clear: () => {
      const commandLines = terminalBody.querySelectorAll('.command-line');
      commandLines.forEach((line, index) => {
        if (index < commandLines.length - 1) {
          line.remove();
        }
      });
      return '';
    },

    cancel: () => {
      if (orderState.step > 0) {
        orderState = { step: 0, type: '', size: '', pizza: '', email: '', orderId: '' };
        return 'Order cancelled. Type "order pizza" to start a new order.';
      }
      return 'No active order to cancel.';
    },

    'track order': () => {
      return `Please enter your order ID:`;
    }
  };

  function processOrderStep(input) {
    input = input.toLowerCase().trim();
    
    switch (orderState.step) {
      case 1: // Type selection
        if (input === 'veg' || input === 'nonveg') {
          orderState.type = input;
          orderState.step = 2;
          let pizzaList = Object.keys(pizzaMenu[input])
            .map(pizza => `  ${pizza.charAt(0).toUpperCase() + pizza.slice(1)}: $${pizzaMenu[input][pizza]}`)
            .join('\n');
          return `Selected ${input === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}\n\nAvailable pizzas:\n${pizzaList}\n\nPlease type the name of your pizza:`;
        }
        return 'Please select "veg" or "nonveg":';

      case 2: // Pizza selection
        const availablePizzas = pizzaMenu[orderState.type];
        if (availablePizzas[input]) {
          orderState.pizza = input;
          orderState.step = 3;
          return `Selected ${input.charAt(0).toUpperCase() + input.slice(1)}\n\nChoose your size:\n- small ($${availablePizzas[input].toFixed(2)})\n- medium ($${(availablePizzas[input] * 1.2).toFixed(2)})\n- large ($${(availablePizzas[input] * 1.4).toFixed(2)})\n\nType your size choice:`;
        }
        return `Invalid pizza selection. Available pizzas:\n${Object.keys(availablePizzas).join(', ')}\n\nPlease type the name of your pizza:`;

      case 3: // Size selection
        if (pizzaSizes[input]) {
          orderState.size = input;
          orderState.step = 4;
          return 'Please enter your email address for order confirmation:';
        }
        return 'Please select a valid size (small, medium, or large):';

      case 4: // Email collection
        if (validateEmail(input)) {
          orderState.email = input;
          const basePrice = pizzaMenu[orderState.type][orderState.pizza];
          const finalPrice = (basePrice * pizzaSizes[orderState.size]).toFixed(2);
          orderState.orderId = generateOrderId();
          
          // Send confirmation email
          sendOrderConfirmation(orderState).then(emailResult => {
            if (emailResult.previewUrl) {
              addCommandLine(`Email preview available at: ${emailResult.previewUrl}`);
            }
          });
          
          // Redirect to tracking page
          setTimeout(() => {
            window.location.href = `/tracking.html?orderId=${orderState.orderId}`;
          }, 3000);

          orderState.step = 0;
          return `Order Summary:
- ${orderState.pizza.charAt(0).toUpperCase() + orderState.pizza.slice(1)} (${orderState.type === 'veg' ? 'Vegetarian' : 'Non-vegetarian'})
- Size: ${orderState.size.charAt(0).toUpperCase() + orderState.size.slice(1)}
- Final Price: $${finalPrice}
- Order ID: ${orderState.orderId}

Thank you for your order! A confirmation email has been sent to ${orderState.email}.
Redirecting to order tracking page...`;
        }
        return 'Please enter a valid email address:';

      default:
        return 'Type "order pizza" to start a new order.';
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function generateOrderId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async function sendOrderConfirmation(order) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      return { error: 'Failed to send email' };
    }
  }

  function addCommandLine(text, isCommand = false) {
    const line = document.createElement('div');
    line.className = 'command-line';
    
    if (isCommand) {
      const prompt = document.createElement('span');
      prompt.className = 'prompt';
      prompt.textContent = '$';
      line.appendChild(prompt);
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    line.appendChild(textSpan);
    
    terminalBody.insertBefore(line, cliInput.parentElement);
  }

  cliInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const command = cliInput.value.trim().toLowerCase();
      
      // Add the command to terminal
      addCommandLine(command, true);
      
      // Process command or order step
      if (orderState.step > 0) {
        const output = processOrderStep(command);
        output.split('\n').forEach(line => addCommandLine(line));
      } else if (commands[command]) {
        const output = commands[command]();
        output.split('\n').forEach(line => addCommandLine(line));
      } else if (command !== '') {
        addCommandLine(`Command not found: ${command}. Type 'help' for available commands.`);
      }
      
      // Clear input
      cliInput.value = '';
      
      // Scroll to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });

  // Focus input on terminal click
  terminalBody.addEventListener('click', () => {
    cliInput.focus();
  });
});