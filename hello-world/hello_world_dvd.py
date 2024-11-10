import pygame
import random
import math

# Initialize pygame
pygame.init()

# Screen settings
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Hello World - 3D Effect")

# Font settings
font = pygame.font.Font(None, 100)
text_surface = font.render("Hello, World!", True, (255, 255, 255))
text_rect = text_surface.get_rect()

# Load music and set up a sound for corner hits
pygame.mixer.music.load("sounds/background_music.mp3")  # Background music file
corner_hit_sound = pygame.mixer.Sound("sounds/corner_hit_sound.wav")  # Corner hit sound
pygame.mixer.music.play(-1)  # Loop background music indefinitely

# Initial position, speed, and animation states
text_x, text_y = random.randint(0, width - text_rect.width), random.randint(0, height - text_rect.height)
speed_x, speed_y = 3, 3
corner_hit = False
crazy_animation = False
animation_start_time = 0

# Function to get random colors
def random_color():
    return random.randint(50, 255), random.randint(50, 255), random.randint(50, 255)

# Main loop
running = True
while running:
    screen.fill((0, 0, 0))

    # Update position
    text_x += speed_x
    text_y += speed_y

    # Check for corner hit
    is_corner_hit = (
        (text_x <= 0 and text_y <= 0) or
        (text_x <= 0 and text_y + text_rect.height >= height) or
        (text_x + text_rect.width >= width and text_y <= 0) or
        (text_x + text_rect.width >= width and text_y + text_rect.height >= height)
    )

    # Trigger crazy animation on corner hit
    if is_corner_hit and not crazy_animation:
        corner_hit_sound.play()
        crazy_animation = True
        animation_start_time = pygame.time.get_ticks()

    # Bounce off walls at fixed angles
    if text_x + text_rect.width >= width or text_x <= 0:
        speed_x = -speed_x
    if text_y + text_rect.height >= height or text_y <= 0:
        speed_y = -speed_y

    # Animation: Check if we're in crazy mode
    if crazy_animation:
        # Calculate animation progress
        elapsed_time = pygame.time.get_ticks() - animation_start_time
        if elapsed_time < 1000:  # 1 second of animation
            # Rapid color cycling
            color = random_color()
            
            # 3D simulation (scaling and rotation)
            scale_factor = 1.2 + 0.5 * math.sin(elapsed_time * 0.005)  # Scale factor simulates depth
            rotation_angle = elapsed_time * 0.1 % 360  # Rotation effect
            
            # Create a 3D effect using transformations
            transformed_surface = pygame.transform.rotozoom(font.render("Hello, World!", True, color), rotation_angle, scale_factor)
            transformed_rect = transformed_surface.get_rect(center=(text_x + text_rect.width // 2, text_y + text_rect.height // 2))
            screen.blit(transformed_surface, transformed_rect)
        else:
            crazy_animation = False  # End animation after 1 second
    else:
        # Default text display without animation
        text_surface = font.render("Hello, World!", True, (255, 255, 255))
        screen.blit(text_surface, (text_x, text_y))

    # Update the display
    pygame.display.flip()

    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Control frame rate
    pygame.time.Clock().tick(60)

# Quit pygame
pygame.quit()