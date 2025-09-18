import pygame
import random
import sys
from pygame import mixer
import os
from end import main as end_game
from highscore import save_high_score
from statemanager import StateManager, State

from easy import easy_questions
from medium import medium_questions
from hard import hard_questions
from lifeline import lifeline_50_50, lifeline_skip_question, lifeline_double_chance, lifeline_pause_timer, lifeline_change_question
import json

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Set up the display
screen = pygame.display.set_mode((1200, 800), pygame.RESIZABLE)
pygame.display.set_caption("QuizTime")

# Load assets
background_image = pygame.image.load("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/background.jpg")
winner_background_image = pygame.image.load("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/winner.jpg")
correct_sound = mixer.Sound("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/correct.wav")
wrong_sound = mixer.Sound("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/wrong.mp3")
mixer.music.load("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/music.wav")
mixer.music.play(-1)  # Play background music in a loop

# Load custom fonts
knightwarrior_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/KnightWarrior.otf", 28)
big_knightwarrior_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/KnightWarrior.otf", 40)
question_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/CaviarDreams_Bold.ttf", 28)
golden_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/CaviarDreams_Bold.ttf", 28)
winner_font = pygame.font.Font("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/KnightWarrior.otf", 60)

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
BLUE = (100, 149, 237)
GREEN = (0, 200, 0)
RED = (200, 0, 0)
GOLDEN = (255, 215, 0)
YELLOW = (255, 255, 0)

# Fonts
font = pygame.font.SysFont(None, 28)
big_font = pygame.font.SysFont(None, 40)

# Helper: Number to Words
def num_to_words(n):
    # A simple converter for numbers up to billions.
    if n == 0:
        return "zero"
    
    under_20 = ["", "one", "two", "three", "four", "five", "six", "seven",
                "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
                "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
    tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
            "eighty", "ninety"]
    thousands = ["", "thousand", "million", "billion"]

    def words(num, idx=0):
        if num == 0:
            return []
        elif num < 20:
            return [under_20[num]] + ([thousands[idx]] if thousands[idx] else [])
        elif num < 100:
            return [tens[num // 10]] + words(num % 10, 0) + ([thousands[idx]] if thousands[idx] and num % 10 == 0 else [])
        else:
            return [under_20[num // 100]] + ["hundred"] + words(num % 100, 0) + ([thousands[idx]] if thousands[idx] and num % 100 == 0 else [])
    
    result = []
    idx = 0
    while n:
        n, rem = divmod(n, 1000)
        if rem:
            result = words(rem, idx) + result
        idx += 1
    return " ".join([w for w in result if w])

def format_prize(n):
    # Returns a string with $ and words (e.g., "$1,000 – One Thousand Dollars")
    return f"${n:,} – {num_to_words(n).capitalize()}"

# Function: Generate Options for a Question
def get_options(question_data):
    # Always include the correct answer and choose 3 random wrong answers from the set of 5.
    wrong_options = random.sample(question_data["wrong"], 3)
    options = wrong_options + [question_data["correct"]]
    random.shuffle(options)
    return options

# UI Helper: Draw Text Centered
def draw_text_center(surface, text, font, color, center):
    text_obj = font.render(text, True, color)
    rect = text_obj.get_rect(center=center)
    surface.blit(text_obj, rect)

# UI Helper: Draw Text Centered with Line Breaks
def draw_text_center_multiline(surface, text, font, color, center, max_width):
    words = text.split(' ')
    lines = []
    current_line = []
    current_width = 0

    for word in words:
        word_width, _ = font.size(word + ' ')
        if current_width + word_width > max_width:
            lines.append(' '.join(current_line))
            current_line = [word]
            current_width = word_width
        else:
            current_line.append(word)
            current_width += word_width

    lines.append(' '.join(current_line))

    total_height = len(lines) * font.get_linesize()
    start_y = center[1] - total_height // 2

    for i, line in enumerate(lines):
        text_obj = font.render(line, True, color)
        rect = text_obj.get_rect(center=(center[0], start_y + i * font.get_linesize()))
        surface.blit(text_obj, rect)

# Button Class
class Button:
    def __init__(self, text, font, color, rect, bg_color=GRAY):
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

# Checkbox Class
class Checkbox:
    def __init__(self, text, font, color, rect, bg_color=GRAY):
        self.text = text
        self.font = font
        self.color = color
        self.rect = pygame.Rect(rect)
        self.bg_color = bg_color
        self.checked = False
        self.text_surf = self.font.render(self.text, True, self.color)
        self.text_rect = self.text_surf.get_rect(center=(self.rect.x + self.rect.width + 10, self.rect.centery))

    def draw(self, surface):
        pygame.draw.rect(surface, self.bg_color, self.rect)
        if self.checked:
            pygame.draw.line(surface, self.color, (self.rect.x, self.rect.y), (self.rect.x + self.rect.width, self.rect.y + self.rect.height), 2)
            pygame.draw.line(surface, self.color, (self.rect.x + self.rect.width, self.rect.y), (self.rect.x, self.rect.y + self.rect.height), 2)
        surface.blit(self.text_surf, self.text_rect)

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

class UsernameState(State):
    def __init__(self):
        self.input_box = pygame.Rect(500, 400, 200, 50)
        self.color_inactive = pygame.Color('yellow')
        self.color_active = pygame.Color('green')
        self.color = self.color_inactive
        self.active = False
        self.text = ''
        self.font = pygame.font.Font(None, 32)
        self.feedback = ""
        self.background_image = pygame.image.load("/home/bishal-shrestha/MyProjects/UbuntuPythonFiles/Files/assets/user.jpg")
        self.lifeline_texts = ["50-50", "Skip", "Double Chance", "Pause Timer", "Change Question"]
        self.lifeline_buttons = [Button(lifeline, self.font, BLACK, (500, 500 + i * 44, 200, 35), bg_color=WHITE) for i, lifeline in enumerate(self.lifeline_texts)]
        self.selected_lifelines = []
        self.continue_button = Button("Continue", self.font, BLACK, (1050, 730, 130, 40), bg_color=YELLOW)
        self.fixed_positions = {
            "input_box": (500, 400),
            "lifeline_buttons": [(500, 500 + i * 44) for i in range(len(self.lifeline_texts))],
            "continue_button": (1050, 730)
        }

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.input_box.collidepoint(event.pos):
                self.active = not self.active
            else:
                self.active = False
            self.color = self.color_active if self.active else self.color_inactive

            for button in self.lifeline_buttons:
                if button.is_clicked(event.pos):
                    if (button.bg_color == GREEN):
                        button.bg_color = WHITE
                        self.selected_lifelines.remove(button.text)
                    elif len(self.selected_lifelines) < 2:
                        button.bg_color = GREEN
                        self.selected_lifelines.append(button.text)
                    else:
                        for btn in self.lifeline_buttons:
                            if btn.bg_color == GREEN and btn != button:
                                btn.bg_color = WHITE
                                self.selected_lifelines.remove(btn.text)
                                break
                        button.bg_color = GREEN
                        self.selected_lifelines.append(button.text)

            if self.continue_button.is_clicked(event.pos):
                if self.text.strip() == "":
                    self.feedback = "Invalid! Please enter a username."
                elif len(self.selected_lifelines) != 2:
                    self.feedback = "Please select exactly 2 lifelines."
                else:
                    state_manager.set_state("game")
                    state_manager.current_state.username = self.text
                    state_manager.current_state.selected_lifelines = self.selected_lifelines

        elif event.type == pygame.KEYDOWN:
            if self.active:
                if event.key == pygame.K_RETURN:
                    if self.text.strip() == "":
                        self.feedback = "Invalid! Please enter a username."
                    elif len(self.selected_lifelines) != 2:
                        self.feedback = "Please select exactly 2 lifelines."
                    else:
                        state_manager.set_state("game")
                        state_manager.current_state.username = self.text
                        state_manager.current_state.selected_lifelines = self.selected_lifelines
                elif event.key == pygame.K_BACKSPACE:
                    self.text = self.text[:-1]
                else:
                    self.text += event.unicode
        elif event.type == pygame.VIDEORESIZE:
            self.input_box.topleft = self.fixed_positions["input_box"]
            for i, button in enumerate(self.lifeline_buttons):
                button.rect.topleft = self.fixed_positions["lifeline_buttons"][i]
            self.continue_button.rect.topleft = self.fixed_positions["continue_button"]

    def update(self):
        pass

    def draw(self, screen):
        screen.fill(BLACK)
        screen.blit(pygame.transform.scale(self.background_image, (screen.get_width(), screen.get_height())), (0, 0))

        prompt_surf = golden_font.render("Enter a Username", True, GOLDEN)
        prompt_rect = prompt_surf.get_rect(center=(screen.get_width() // 2, 200))
        screen.blit(prompt_surf, prompt_rect)

        txt_surface = self.font.render(self.text, True, self.color)
        width = max(200, txt_surface.get_width()+10)
        self.input_box.w = width
        screen.blit(txt_surface, (self.input_box.x+5, self.input_box.y+5))
        pygame.draw.rect(screen, self.color, self.input_box, 2)

        for button in self.lifeline_buttons:
            button.draw(screen)

        self.continue_button.draw(screen)

        if self.feedback:
            feedback_surf = golden_font.render(self.feedback, True, RED)
            feedback_rect = feedback_surf.get_rect(center=(screen.get_width() // 2, 450))
            screen.blit(feedback_surf, feedback_rect)

# Load asked questions
asked_questions_file = "/home/bishal-shrestha/MyProjects/QuizTime/asked.json"
if os.path.exists(asked_questions_file):
    with open(asked_questions_file, "r") as file:
        asked_questions = json.load(file)
else:
    asked_questions = []

# Create a set of asked question texts for faster lookup
asked_question_texts = {aq["question"] for aq in asked_questions}

# Function to save asked questions
def save_asked_questions():
    with open(asked_questions_file, "w") as file:
        json.dump(asked_questions, file, indent=4)

# Function to remove a question from its respective file
def remove_question_from_file(question_text, difficulty):
    if difficulty == "easy":
        file_path = "/home/bishal-shrestha/MyProjects/QuizTime/easy.py"
        questions = easy_questions
    elif difficulty == "medium":
        file_path = "/home/bishal-shrestha/MyProjects/QuizTime/medium.py"
        questions = medium_questions
    elif difficulty == "hard":
        file_path = "/home/bishal-shrestha/MyProjects/QuizTime/hard.py"
        questions = hard_questions

    questions = [q for q in questions if q["question"] != question_text]

    with open(file_path, "w") as file:
        file.write(f"{difficulty}_questions = {json.dumps(questions, indent=4)}")

# Function to update stats
def update_stats(username, prize, questions_answered):
    stats_file = "/home/bishal-shrestha/MyProjects/QuizTime/stats.json"
    if os.path.exists(stats_file):
        with open(stats_file, "r") as file:
            stats = json.load(file)
    else:
        stats = {}

    if username not in stats:
        stats[username] = {
            "games_played": 0,
            "total_prize": 0,
            "total_questions_answered": 0
        }

    stats[username]["games_played"] += 1
    stats[username]["total_prize"] += prize
    stats[username]["total_questions_answered"] += questions_answered

    with open(stats_file, "w") as file:
        json.dump(stats, file, indent=4)

class GameState(State):
    def __init__(self):
        self.username = ""
        self.selected_lifelines = []
        self.current_question_index = 0
        self.total_questions = 0
        self.current_prize = 0
        self.running = True
        self.selected_option = None
        self.feedback = ""
        self.show_feedback = False
        self.feedback_timer = 0
        self.selected_option_index = 0
        self.locked_option = False
        self.lifelines_used = {lifeline: False for lifeline in ["50-50", "Skip", "Double Chance", "Pause Timer", "Change Question"]}
        self.lifelines_used_count = 0
        self.double_chance_used = False
        self.double_chance_attempts = 0
        self.paused_time = 0
        self.timer_paused = False
        self.question_start_time = pygame.time.get_ticks()
        self.clock = pygame.time.Clock()
        self.questions_options = []
        self.all_questions = []
        self.prize_levels = [25000, 50000, 100000, 200000, 400000, 800000, 1600000, 3200000, 6400000, 12800000, 25600000, 51200000, 102400000, 204800000, 700000000]

    def on_enter(self):
        # Ensure easy_questions, medium_questions, and hard_questions are lists of dictionaries
        global easy_questions, medium_questions, hard_questions
        if not all(isinstance(q, dict) for q in easy_questions):
            raise TypeError("easy_questions must be a list of dictionaries")
        if not all(isinstance(q, dict) for q in medium_questions):
            raise TypeError("medium_questions must be a list of dictionaries")
        if not all(isinstance(q, dict) for q in hard_questions):
            raise TypeError("hard_questions must be a list of dictionaries")

        # Filter out already asked questions using sets for faster lookup
        easy_questions = [q for q in easy_questions if q["question"] not in asked_question_texts]
        medium_questions = [q for q in medium_questions if q["question"] not in asked_question_texts]
        hard_questions = [q for q in hard_questions if q["question"] not in asked_question_texts]

        selected_easy = random.sample(easy_questions, 3)
        selected_medium = random.sample(medium_questions, 6)
        selected_hard = random.sample(hard_questions, 6)
        self.all_questions = selected_easy + selected_medium + selected_hard
        unique_questions = []
        for q in self.all_questions:
            if q not in unique_questions:
                unique_questions.append(q)
        self.all_questions = unique_questions
        self.total_questions = len(self.all_questions)
        self.questions_options = [get_options(q) for q in self.all_questions]
        self.question_start_time = pygame.time.get_ticks()

    def handle_event(self, event):
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == pygame.VIDEORESIZE:
            screen_width, screen_height = event.size
            screen = pygame.display.set_mode((screen_width, screen_height), pygame.RESIZABLE)
            for i, button in enumerate(self.option_buttons):
                button.rect.topleft = (screen_width // 2 - 300, screen_height // 2 - 100 + i * 60)
            for i, button in enumerate(self.lifeline_buttons):
                if i < 3:
                    button.rect.topleft = (screen_width - 170, screen_height // 2 - 100 + i * 60)
                else:
                    button.rect.topleft = (20, screen_height // 2 - 100 + (i - 3) * 60)
            self.quit_button.rect.topleft = (screen_width - 150, 70)

        elif event.type == pygame.KEYDOWN and not self.show_feedback:
            if event.key == pygame.K_DOWN:
                self.selected_option_index = (self.selected_option_index + 1) % len(self.options)
            elif event.key == pygame.K_UP:
                self.selected_option_index = (self.selected_option_index - 1) % len(self.options)
            elif event.key == pygame.K_RETURN:
                if self.locked_option:
                    self.selected_option = self.options[self.selected_option_index]
                    # Check if answer is correct
                    correct_answer = self.all_questions[self.current_question_index]["correct"]
                    if self.selected_option == correct_answer:
                        self.feedback = "Correct!"
                        self.current_prize = self.prize_levels[self.current_question_index]
                        correct_sound.play()  # Play correct sound effect
                        if self.double_chance_used:
                            self.lifelines_used["Double Chance"] = True  # Mark double chance as used
                        self.show_feedback = True
                        self.feedback_timer = pygame.time.get_ticks()
                    else:
                        if self.double_chance_used and self.double_chance_attempts < 1:
                            self.double_chance_attempts += 1
                            self.feedback = "Wrong Answer! Try Again."
                            wrong_sound.play()  # Play wrong sound effect
                            self.locked_option = False
                            self.show_feedback = False
                        else:
                            self.feedback = "Wrong Answer! Game Over."
                            wrong_sound.play()  # Play wrong sound effect
                            self.show_feedback = True
                            self.feedback_timer = pygame.time.get_ticks()
                else:
                    self.locked_option = True
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = pygame.mouse.get_pos()
            if self.quit_button.is_clicked((mx, my)):
                pygame.quit()
                sys.exit()
            if not self.show_feedback:
                for i, button in enumerate(self.option_buttons):
                    if button.is_clicked((mx, my)):
                        if self.locked_option:
                            self.selected_option = button.text
                            self.selected_option_index = i
                            # Check if answer is correct
                            correct_answer = self.all_questions[self.current_question_index]["correct"]
                            if self.selected_option == correct_answer:
                                self.feedback = "Correct!"
                                self.current_prize = self.prize_levels[self.current_question_index]
                                correct_sound.play()  # Play correct sound effect
                                if self.double_chance_used:
                                    self.lifelines_used["Double Chance"] = True  # Mark double chance as used
                                self.show_feedback = True
                                self.feedback_timer = pygame.time.get_ticks()
                            else:
                                if self.double_chance_used and self.double_chance_attempts < 1:
                                    self.double_chance_attempts += 1
                                    self.feedback = "Wrong Answer! Try Again."
                                    wrong_sound.play()  # Play wrong sound effect
                                    self.locked_option = False
                                    self.show_feedback = False
                                else:
                                    self.feedback = "Wrong Answer! Game Over."
                                    wrong_sound.play()  # Play wrong sound effect
                                    self.show_feedback = True
                                    self.feedback_timer = pygame.time.get_ticks()
                        else:
                            self.selected_option_index = i
                            self.locked_option = True
                        break
                for lifeline_button in self.lifeline_buttons:
                    if lifeline_button.is_clicked((mx, my)) and lifeline_button.active and self.lifelines_used_count < 3:
                        if confirm_lifeline_use(lifeline_button.text):
                            lifeline_button.action()
                            lifeline_button.active = False
                            self.lifelines_used[lifeline_button.key] = True
                            self.lifelines_used_count += 1
                        break

    def update(self):
        screen_width, screen_height = screen.get_size()
        # Determine the time limit based on current question index.
        if self.current_question_index < 3:
            time_limit = 15
        elif self.current_question_index < 9:
            time_limit = 20
        else:
            time_limit = 30
        
        # Calculate elapsed time (in seconds) for the current question.
        if not self.timer_paused:
            elapsed_time = (pygame.time.get_ticks() - self.question_start_time - self.paused_time) / 1000
        else:
            elapsed_time = self.paused_time / 1000
        time_left = max(0, time_limit - int(elapsed_time))
        
        # Check if time has run out for the current question.
        if elapsed_time > time_limit and not self.show_feedback:
            self.feedback = "Time's up! Game Over."
            self.show_feedback = True
            self.feedback_timer = pygame.time.get_ticks()
        
        # If all questions answered, display winning message
        if self.current_question_index >= self.total_questions:
            screen.fill(BLACK)
            screen.blit(pygame.transform.scale(winner_background_image, (screen_width, screen_height)), (0, 0))  # Draw winner background image
            draw_text_center(screen, "Congratulations, you are a winner!", winner_font, GOLDEN, (screen_width//2, screen_height//2 - 40))
            prize_text = format_prize(self.current_prize)
            draw_text_center(screen, f"Your prize: {prize_text}", big_knightwarrior_font, GOLDEN, (screen_width//2, screen_height - 40))
            pygame.display.update()
            winner_screen = True
            while winner_screen:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        pygame.quit()
                        sys.exit()
                    elif event.type == pygame.KEYDOWN or event.type == pygame.MOUSEBUTTONDOWN:
                        save_high_score(self.username, self.current_prize, self.current_question_index)
                        update_stats(self.username, self.current_prize, self.current_question_index)
                        winner_screen = False
                        end_game()
            self.running = False
            return

        # If feedback needs to be shown (Correct / Wrong / Time's up)
        if self.show_feedback:
            # Show feedback for 1.5 seconds before proceeding.
            if pygame.time.get_ticks() - self.feedback_timer > 1500:
                if self.feedback == "Correct!":
                    # Calculate the time taken to answer the question
                    time_taken = (pygame.time.get_ticks() - self.question_start_time - self.paused_time) / 1000
                    # Determine the full time for the current question
                    if self.current_question_index < 3:
                        full_time = 15
                        difficulty = "easy"
                    elif self.current_question_index < 9:
                        full_time = 20
                        difficulty = "medium"
                    else:
                        full_time = 30
                        difficulty = "hard"
                    # Save the correctly answered question with details
                    asked_question_details = {
                        "username": self.username,
                        "question": self.all_questions[self.current_question_index]["question"],
                        "answer": self.selected_option,
                        "time": f"{time_taken:.2f}/{full_time}",
                        "prize": self.current_prize,
                        "questions_answered": self.current_question_index + 1
                    }
                    asked_questions.append(asked_question_details)
                    save_asked_questions()
                    # Remove the question from its respective file
                    remove_question_from_file(self.all_questions[self.current_question_index]["question"], difficulty)
                    self.current_question_index += 1
                    # Reset question start time for the next question.
                    self.question_start_time = pygame.time.get_ticks()
                    self.paused_time = 0
                    self.timer_paused = False
                    self.double_chance_used = False
                    self.double_chance_attempts = 0
                else:
                    # Game over, so display final prize and then break.
                    draw_text_center(screen, f"Final Prize: {format_prize(self.current_prize)}", big_font, GREEN, (screen_width//2, screen_height//2+250))
                    pygame.display.update()
                    pygame.time.delay(3000)
                    save_high_score(self.username, self.current_prize, self.current_question_index)
                    update_stats(self.username, self.current_prize, self.current_question_index)
                    end_game()
                    self.running = False
                self.show_feedback = False
                self.selected_option = None
                self.locked_option = False
                self.lifelines_used_count = 0  # Reset lifeline usage count for the next question

    def draw(self, screen):
        screen_width, screen_height = screen.get_size()
        screen.fill(BLACK)
        screen.blit(pygame.transform.scale(background_image, (screen_width, screen_height)), (0, 0))  # Draw background image

        # Determine the time limit based on current question index.
        if self.current_question_index < 3:
            time_limit = 15
        elif self.current_question_index < 9:
            time_limit = 20
        else:
            time_limit = 30
        
        # Calculate elapsed time (in seconds) for the current question.
        if not self.timer_paused:
            elapsed_time = (pygame.time.get_ticks() - self.question_start_time - self.paused_time) / 1000
        else:
            elapsed_time = self.paused_time / 1000
        time_left = max(0, time_limit - int(elapsed_time))
        
        # Display timer on the screen (top-right corner).
        timer_text = font.render(f"Time Left: {time_left}s", True, GOLDEN)
        screen.blit(timer_text, (screen_width - 150, 20))

        # Draw Quit button below the timer
        self.quit_button = Button("Quit", font, BLACK, (screen_width - 150, 70, 100, 40), bg_color=YELLOW)
        self.quit_button.draw(screen)

        # Display current question and options.
        qdata = self.all_questions[self.current_question_index]
        self.options = self.questions_options[self.current_question_index]

        # Draw question number in the leftmost corner.
        question_number_text = font.render(f"Question {self.current_question_index + 1} / {self.total_questions}", True, GOLDEN)
        screen.blit(question_number_text, (20, 20))

        # Display the question text using question_font
        draw_text_center_multiline(screen, qdata["question"], golden_font, GOLDEN, (screen_width//2, screen_height//2 - 200), screen_width - 100)
        
        # Draw option buttons
        self.option_buttons = []
        start_y = screen_height // 2 - 100
        gap = 60
        for i, option in enumerate(self.options):
            if self.show_feedback:
                if option == qdata["correct"]:
                    bg_color = GREEN
                elif option == self.selected_option:
                    bg_color = RED
                else:
                    bg_color = GRAY
            else:
                bg_color = YELLOW if self.locked_option and i == self.selected_option_index else (BLUE if i == self.selected_option_index else GRAY)
            rect = pygame.Rect(screen_width // 2 - 300, start_y + i * gap, 600, 40)
            button = Button(option, font, BLACK, rect, bg_color=bg_color)
            self.option_buttons.append(button)
            button.draw(screen)

        # Display prize money in the upper center
        prize_text_number = f"${self.current_prize:,}"
        draw_text_center(screen, prize_text_number, golden_font, GOLDEN, (screen_width//2, 40))

        # Display prize money in words in the center of the bottom
        prize_text_words = num_to_words(self.current_prize).capitalize()
        draw_text_center(screen, prize_text_words, golden_font, GOLDEN, (screen_width//2, screen_height - 40))

        # Draw lifeline buttons
        self.lifeline_buttons = []
        lifeline_texts = ["50-50", "Skip", "Double Chance", "Pause Timer", "Change Question"]
        lifeline_keys = ["50-50", "Skip", "Double Chance", "Pause Timer", "Change Question"]
        lifeline_actions = [
            lambda: use_lifeline_50_50(self.options, qdata["correct"]),
            lambda: use_lifeline_skip_question(),
            lambda: use_lifeline_double_chance(),
            lambda: use_lifeline_pause_timer(),
            lambda: use_lifeline_change_question()
        ]
        for i, (text, key, action) in enumerate(zip(lifeline_texts, lifeline_keys, lifeline_actions)):
            bg_color = WHITE if self.lifelines_used[key] else YELLOW
            if key not in self.selected_lifelines:
                bg_color = GRAY
            if i < 3:
                rect = pygame.Rect(screen_width - 170, start_y + i * gap, 150, 40)
            else:
                rect = pygame.Rect(20, start_y + (i - 3) * gap, 150, 40)
            button = Button(text, font, BLACK, rect, bg_color=bg_color)
            button.action = action
            button.active = not self.lifelines_used[key] and key in self.selected_lifelines
            button.key = key
            self.lifeline_buttons.append(button)
            button.draw(screen)

        # If feedback needs to be shown (Correct / Wrong / Time's up)
        if self.show_feedback:
            draw_text_center(screen, self.feedback, big_font, GREEN if self.feedback=="Correct!" else RED, (screen_width//2, start_y + 4 * gap + 40))

def confirm_lifeline_use(lifeline_name):
    # Display confirmation dialog for lifeline use
    # Return True if user confirms, otherwise False
    return True  # For simplicity, always return True in this example

def use_lifeline_50_50(options, correct_option):
    global state_manager
    state_manager.current_state.questions_options[state_manager.current_state.current_question_index] = lifeline_50_50(options, correct_option)

def use_lifeline_skip_question():
    global state_manager
    state_manager.current_state.current_question_index = (state_manager.current_state.current_question_index + 1) % state_manager.current_state.total_questions

def use_lifeline_double_chance():
    global state_manager
    state_manager.current_state.double_chance_used = True
    state_manager.current_state.double_chance_attempts = 0

def use_lifeline_pause_timer():
    global state_manager
    if not state_manager.current_state.timer_paused:
        state_manager.current_state.paused_time = pygame.time.get_ticks() - state_manager.current_state.question_start_time
        state_manager.current_state.timer_paused = True
    else:
        state_manager.current_state.question_start_time = pygame.time.get_ticks() - state_manager.current_state.paused_time
        state_manager.current_state.timer_paused = False

def use_lifeline_change_question():
    global state_manager
    current_question = state_manager.current_state.all_questions[state_manager.current_state.current_question_index]
    remaining_questions = [q for q in state_manager.current_state.all_questions if q != current_question and q["question"] != current_question["question"]]
    new_question = random.choice(remaining_questions)
    state_manager.current_state.all_questions[state_manager.current_state.current_question_index] = new_question
    state_manager.current_state.questions_options[state_manager.current_state.current_question_index] = get_options(new_question)

def main():
    global state_manager
    state_manager = StateManager()
    state_manager.add_state("username", UsernameState())
    state_manager.add_state("game", GameState())
    state_manager.set_state("username")

    screen = pygame.display.set_mode((1200, 800), pygame.RESIZABLE)
    pygame.display.set_caption("QuizTime")

    while True:
        for event in pygame.event.get():
            state_manager.handle_event(event)
        state_manager.update()
        state_manager.draw(screen)
        pygame.display.flip()

if __name__ == "__main__":
    main()
