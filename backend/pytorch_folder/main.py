import torch
from torchvision import datasets
from torch.utils.data import DataLoader
from torchvision.transforms import ToTensor
from torch import nn
import matplotlib.pyplot as plt

training_data = datasets.FER2013(
    root="./pytorch_folder", transform=ToTensor()
)

test_data = datasets.FER2013(
    root="./pytorch_folder", split="test", transform=ToTensor()
)

batch_size = 64

# dataloaders convert datasets into iterables, with each element being a batch of 64 data pieces
train_dataloader = DataLoader(training_data, batch_size=batch_size, shuffle=True)
test_dataloader = DataLoader(test_data, batch_size=batch_size)
for X, y in test_dataloader:
    print(f"Shape of X [N, C, H, W]: {X.shape}")
    print(f"Shape of y: {y.shape} {y.dtype}")
    break

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

# code below simply outputs examples of data from dataset with labels
# figure = plt.figure(figsize=(8, 8))
# cols, rows = 3, 3
# for i in range(1, cols * rows + 1):
#     sample_idx = torch.randint(len(training_data), size=(1,)).item()
#     img, label = training_data[sample_idx]
#     figure.add_subplot(rows, cols, i)
#     plt.title(labels_map[label])
#     plt.axis("off")
#     plt.imshow(img.squeeze(), cmap="gray")
# plt.show()

# now we will began training the model

device = torch.accelerator.current_accelerator().type if torch.accelerator.is_available() else "cpu" # can be an accelerator, if available (like gpu)
print(f"Using {device} device")

# defining the model
class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.linear_relu_stack = nn.Sequential( #sequential pipes output from one function to another
            nn.Linear(48 * 48, 512), # applies linear transformation to tensors
            nn.ReLU(), # applies rectified linear unit function (basically y = max(0, x))
            nn.Linear(512, 1024),
            nn.ReLU(), # ReLU is an example of a non-linear activation function!
            nn.Linear(1024, 1024),
            nn.ReLU(),
            nn.Linear(1024, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Linear(512, 7)
        )
    def forward(self, x):
        x = self.flatten(x)
        logits = self.linear_relu_stack(x)
        return logits

model = NeuralNetwork().to(device)
print(model)

# now we make a loss function and optimizer to optimize the model!

loss_fn = nn.CrossEntropyLoss() # CrossEntropyLoss is a loss fn, which is a fn that gauges the error b/w predicted output and target output
optimizer = torch.optim.SGD(model.parameters(), lr=0.1) # SGD, stochastic gradient descent, is an optimizer, an algorith which attempts to decrease loss
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
    with torch.no_grad(): # disables gradient calculation
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


# the model can now be used!

classes = [
    "Angry",
    "Disgust",
    "Fear",
    "Happy",
    "Sad",
    "Surpise",
    "Neutral",
]

model.eval()
x, y = test_data[11][0], test_data[11][1]
with torch.no_grad():
    x = x.to(device)
    pred = model(x)
    predicted, actual = classes[pred[0].argmax(0)], classes[y]
    print(f'Predicted: "{predicted}", Actual: "{actual}"')



