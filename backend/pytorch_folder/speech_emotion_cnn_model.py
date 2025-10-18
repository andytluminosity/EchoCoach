import torch
import torch.nn as nn
import torch.nn.functional as F

class CNNModel(nn.Module):
    def __init__(self, input_length=2376):
        super(CNNModel, self).__init__()

        # Convolution layers (nn.conv1d)
        #   Extract features from the 1D input data and put it through feature maps
        #   Eg. nn.Conv1d(1, 512, 5, stride=1, padding=2)
        #       Input: 1 channel
        #       Feature maps: 512

        # Batch Normalization layers (nn.BatchNorm1d)
        #   Used after each convolution to normalize the activations and improve 
        #   training stability.

        # Max Pooling layers (nn.MaxPool1d)
        #   Downsample feature maps, reducing the spatial dimension of the data 
        #   to help the model not be overly sensitive to little changes in input

        # Dropout Layers (nn.Dropout)
        #   Randomly drop a fraction of units from training to prevent overfitting

        self.conv1 = nn.Conv1d(1, 512, 5, stride=1, padding=2)
        self.bn1 = nn.BatchNorm1d(512)
        self.pool1 = nn.MaxPool1d(5, stride=2, padding=2)

        self.conv2 = nn.Conv1d(512, 512, 5, stride=1, padding=2)
        self.bn2 = nn.BatchNorm1d(512)
        self.pool2 = nn.MaxPool1d(5, stride=2, padding=2)
        self.dropout1 = nn.Dropout(0.2)

        self.conv3 = nn.Conv1d(512, 256, 5, stride=1, padding=2)
        self.bn3 = nn.BatchNorm1d(256)
        self.pool3 = nn.MaxPool1d(5, stride=2, padding=2)

        self.conv4 = nn.Conv1d(256, 256, 3, stride=1, padding=1)
        self.bn4 = nn.BatchNorm1d(256)
        self.pool4 = nn.MaxPool1d(5, stride=2, padding=2)
        self.dropout2 = nn.Dropout(0.2)

        self.conv5 = nn.Conv1d(256, 128, 3, stride=1, padding=1)
        self.bn5 = nn.BatchNorm1d(128)
        self.pool5 = nn.MaxPool1d(3, stride=2, padding=1)
        self.dropout3 = nn.Dropout(0.2)

        # Finally reshape back to a 1D vector
        self.flatten = nn.Flatten()

        # Compute flattened size dynamically
        with torch.no_grad():
            dummy_input = torch.zeros(1, 1, input_length)  # (batch, channels, seq_len)
            x = self.pool1(self.bn1(self.conv1(dummy_input)))
            x = self.pool2(self.bn2(self.conv2(x)))
            x = self.dropout1(x)
            x = self.pool3(self.bn3(self.conv3(x)))
            x = self.pool4(self.bn4(self.conv4(x)))
            x = self.dropout2(x)
            x = self.pool5(self.bn5(self.conv5(x)))
            x = self.dropout3(x)
            flattened_size = x.numel()  # total number of features in flattened tensor

        # First fully connected layer takes the flattened size to output 512 features
        self.fc1 = nn.Linear(flattened_size, 512)

        # Perform batch normalization on fc1
        self.bn_fc1 = nn.BatchNorm1d(512)

        # Takes 512 features from fc1 and maps them to the 7 output emotions
        self.fc2 = nn.Linear(512, 7)

    def forward(self, x):
        x = x.permute(0, 2, 1)  # (batch, seq_len, 1) -> (batch, 1, seq_len)
        x = F.relu(self.bn1(self.conv1(x)))
        x = self.pool1(x)
        x = F.relu(self.bn2(self.conv2(x)))
        x = self.pool2(x)
        x = self.dropout1(x)
        x = F.relu(self.bn3(self.conv3(x)))
        x = self.pool3(x)
        x = F.relu(self.bn4(self.conv4(x)))
        x = self.pool4(x)
        x = self.dropout2(x)
        x = F.relu(self.bn5(self.conv5(x)))
        x = self.pool5(x)
        x = self.dropout3(x)
        x = self.flatten(x)
        x = F.relu(self.bn_fc1(self.fc1(x)))
        x = self.fc2(x)
        output = F.log_softmax(x, dim=1)
        return output