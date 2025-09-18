import pygame
import json
import sys
import os

# Initialize Pygame
pygame.init()

# Load assets
background_image = pygame.image.load("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/highscore.jpg")
golden_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/CaviarDreams_Bold.ttf", 28)
title_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/KnightWarrior.otf", 60)

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GOLDEN = (255, 215, 0)

# Button Class
class Button:
    def __init__(self, text, font, color, rect, bg_color=GOLDEN):
        self.text = text
        self.font = font
        self.color = color
        self.rect = pygame.Rect(rect)
        self.bg_color = bg_color
        self.text_surf = self.font.render(self.text, True, self.color)
        self.text_rect = self.text_surf.get_rect(center=self.rect.center)

    def draw(self, surface):
        pygame.draw.rect(surface, self.bg_color, self.rect)
        surface.blit(self.text_surf, self.text_rect)

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

def show_stats():
    from game import main_menu

    screen = pygame.display.set_mode((1200, 800), pygame.RESIZABLE)
    pygame.display.set_caption("QuizTime Stats")

    # Load stats
    stats_file = "/home/bishal-shrestha/MyProjects/QuizTime/stats.json"
    if os.path.exists(stats_file):
        with open(stats_file, "r") as file:
            stats = json.load(file)
    else:
        stats = {
            "fastest_answer": None,
            "slowest_answer": None,
            "most_incorrect": None
        }

    stats_list = [
        ("Fastest Answered Question", stats["fastest_answer"]),
        ("Slowest Answered Question", stats["slowest_answer"]),
        ("Most Incorrectly Answered Question", stats["most_incorrect"])
    ]

    buttons = [
        Button("Main Menu", golden_font, BLACK, (500, 700, 200, 50))
    ]

    running = True
    while running:
        screen.fill(BLACK)
        screen.blit(pygame.transform.scale(background_image, (screen.get_width(), screen.get_height())), (0, 0))

        # Display stats title
        title_surf = title_font.render("Stats", True, GOLDEN)
        title_rect = title_surf.get_rect(center=(screen.get_width() // 2, 50))
        screen.blit(title_surf, title_rect)

        # Display stats
        y_offset = 150
        for stat_name, stat in stats_list:
            if stat:
                stat_text = f"{stat_name}: {stat['question']} - {stat['answer']} ({stat['time']} sec)"
            else:
                stat_text = f"{stat_name}: No data available"
            stat_surf = golden_font.render(stat_text, True, GOLDEN)
            stat_rect = stat_surf.get_rect(center=(screen.get_width() // 2, y_offset))
            screen.blit(stat_surf, stat_rect)
            y_offset += 50

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                if buttons[0].is_clicked((mx, my)):
                    main_menu()

        for button in buttons:
            button.draw(screen)

        pygame.display.update()

if __name__ == "__main__":
    show_stats()
