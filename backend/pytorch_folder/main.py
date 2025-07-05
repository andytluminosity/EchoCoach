import torch
from torchvision import datasets
from torchvision.transforms import ToTensor
import matplotlib.pyplot as plt
x = torch.rand(5, 3)
print(x)

training_data = datasets.FER2013(
    root="./pytorch_folder", transform=ToTensor()
)

test_data = datasets.FER2013(
    root="./pytorch_folder", split="test", transform=ToTensor()
)

labels_map = {
    0: "Angry",
    1: "Disgust",
    2: "Fear",
    3: "Happy",
    4: "Sad",
    5: "Surpise",
    6: "Neutral",
}

print(training_data)

print(test_data)

figure = plt.figure(figsize=(8, 8))
cols, rows = 3, 3
for i in range(1, cols * rows + 1):
    sample_idx = torch.randint(len(training_data), size=(1,)).item()
    img, label = training_data[sample_idx]
    figure.add_subplot(rows, cols, i)
    plt.title(labels_map[label])
    plt.axis("off")
    plt.imshow(img.squeeze(), cmap="gray")
plt.show()

