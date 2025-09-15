import torch
import torchvision
from torch.utils.data import DataLoader
from torchvision.transforms import ToTensor
from torch import nn
import matplotlib.pyplot as plt

preprocess = torchvision.transforms.Compose([
    torchvision.transforms.Resize((224, 224)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

train_dataset = torchvision.datasets.ImageFolder('./pytorch_folder/affectnet/Train', transform=preprocess)
test_dataset = torchvision.datasets.ImageFolder('./pytorch_folder/affectnet/Test', transform=preprocess)

train_dataloader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_dataloader = DataLoader(test_dataset, batch_size=64, shuffle=True)

print(train_dataset.class_to_idx)

for X, y in test_dataloader:
    print(f"Shape of X [N, C, H, W]: {X.shape}")
    print(f"Shape of y: {y.shape} {y.dtype}")
    break

labels_map = {
    0: "Angry",
    1: "Contempt",
    2: "Disgust",
    3: "Fear",
    4: "Happy",
    5: "Neutral",
    6: "Sad",
    7: "Surpise"
}

# code below simply outputs examples of data from dataset with labels
# figure = plt.figure(figsize=(8, 8))
# cols, rows = 3, 3
# for i in range(1, cols * rows + 1):
#     sample_idx = torch.randint(len(train_dataset), size=(1,)).item()
#     print(train_dataset[sample_idx])
#     img, label = train_dataset[sample_idx]
#     figure.add_subplot(rows, cols, i)
#     plt.title(labels_map[label])
#     plt.axis("off")
#     plt.imshow(torch.permute(img.squeeze(), (1,2,0)))
# plt.show()

device = torch.device('mps')
print(f"Using {device} device")

# Warm-up
for _ in range(100):
    torch.matmul(torch.rand(500,500).to(device), torch.rand(500,500).to(device))

# defining the model
class NeuralNetwork(nn.Module):
    def __init__(self, input_shape: int):
        super().__init__()
        self.conv_block_1 = nn.Sequential(
            nn.Conv2d(in_channels=input_shape, # creating a conv layer. unlike linear layers, deals with nested tensor rather than flattened
                      out_channels=32,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.Conv2d(in_channels=32, # another conv layer. these layers get the 'features' of the classes
                      out_channels=64,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25),
        )
        self.conv_block_2 = nn.Sequential(
            nn.Conv2d(in_channels=64,
                      out_channels=128,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.Conv2d(in_channels=128,
                      out_channels=128,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25)
        )
        self.conv_block_3 = nn.Sequential(
            nn.Conv2d(in_channels=128,
                      out_channels=256,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.Conv2d(in_channels=256,
                      out_channels=256,
                      kernel_size=3,
                      stride=1,
                      padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.MaxPool2d(kernel_size=2),
            nn.Dropout(0.25)
        )
        self.classifer = nn.Sequential( # classifier is the final linear layer to convert tensor into output
            nn.Flatten(),
            nn.Linear(in_features=256*12*12,
                      out_features=256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.5),
            nn.Linear(in_features=256,
                      out_features=8)
        )
    def forward(self, x):
        x = self.conv_block_1(x)
        # print(f"Output shape of conv_block_1 is: {x.shape}")
        x = self.conv_block_2(x)
        # print(f"Output shape of conv_block_2 is: {x.shape}")
        x = self.conv_block_3(x)
        # print(f"Output shape of conv_block_3 is: {x.shape}")
        logits = self.classifer(x)
        return logits

model = NeuralNetwork(input_shape=3).to(device) # input shape is 1, since 1 colour channel (b&w)
# print(model)

model = torchvision.models.resnet18().to(device)
model.fc = torch.nn.Linear(model.fc.in_features, 8).to(device)
print(model)

# now we make a loss function and optimizer to optimize the model!

loss_fn = nn.CrossEntropyLoss() # CrossEntropyLoss is a loss fn, which is a fn that gauges the error b/w predicted output and target output
optimizer = torch.optim.Adam(model.parameters(), lr=0.001) # SGD, stochastic gradient descent, is an optimizer, an algorith which attempts to decrease loss
# lr is the learning rate, the most important hyper parameter (parameter we can set)

# we can now begin to train the model

def train(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)
    model.train() # sets the model to training mode
    for batch, (X, y) in enumerate(dataloader): # loops through every batch in dataloader
        X, y = X.to(device), y.to(device)

        # compute prediction error
        pred = model(X)
        loss = loss_fn(pred, y)

        # backpropagation - a gradient computation method to reduce difference b/w predicted and actual outputs

        optimizer.zero_grad() # we set gradients back to zero every batch, so they don't accumulate
        loss.backward()
        optimizer.step() # performs a single optimization step

        if batch % 100 == 0:
            loss, current = loss.item(), (batch + 1) * len(X)
            print(f"loss: {loss:>7f}  [{current:>5d}/{size:>5d}]")

# now that the model can be trained, we need to test it to ensure it's working

def test(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)

    model.eval() # sets the model to eval mode
    test_loss, correct = 0, 0
    with torch.inference_mode(): # disables gradient calculation
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            pred = model(X)
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()
    test_loss /= num_batches
    correct /= size
    print(pred)
    print(torch.argmax(pred, 1))
    print(y)
    print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")

# now its time to actually train and test the model!

epochs = 64 # an epoch is an iteration of the training cycle
for t in range(epochs):
    print(f"Epoch {t+1}\n-------------------------------")
    train(train_dataloader, model, loss_fn, optimizer)
    test(test_dataloader, model, loss_fn)
print("Done!")

torch.save(model.state_dict(), 'affectnet.pth')